﻿// Copyright (c) Source Tree Solutions, LLC. All rights reserved.
// Licensed under the Apache License, Version 2.0. 
// Author:                  Joe Audette
// Created:                 2017-02-15
// Last Modified:           2017-02-15
// 

using cloudscribe.FileManager.Web.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace cloudscribe.FileManager.Web.Services
{
    public class FileManagerService
    {
        public FileManagerService(
            IMediaRootPathResolver mediaPathResolver,
            ILogger<FileManagerService> logger
            )
        {
            this.mediaPathResolver = mediaPathResolver;
            log = logger;
        }

        private IMediaRootPathResolver mediaPathResolver;
        private MediaRootPathInfo rootPath;
        private ILogger log;

        private async Task EnsureProjectSettings()
        {
            if (rootPath != null) { return; }
            rootPath = await mediaPathResolver.Resolve().ConfigureAwait(false);
            if (rootPath != null) { return; }
        }

        public async Task<ImageUploadResult> ProcessFile(IFormFile formFile, ImageProcessingOptions options, int eventCode)
        {
            await EnsureProjectSettings().ConfigureAwait(false);

            var origSizeVirtualPath = rootPath.RootVirtualPath + options.ImageOriginalSizeVirtualSubPath;
            var origSizeFsPath = Path.Combine(rootPath.RootFileSystemPath, options.ImageOriginalSizeVirtualSubPath.Replace('/', Path.DirectorySeparatorChar));
            var newName = formFile.FileName.ToCleanFileName();
            var newUrl = origSizeVirtualPath + newName;
            var fsPath = Path.Combine(origSizeFsPath, newName);

            try
            {
                using (var stream = new FileStream(fsPath, FileMode.Create))
                {
                    await formFile.CopyToAsync(stream);
                }

                // TODO: create websize, thumbnail
                // return websize

                return new ImageUploadResult
                {
                    OriginalSizeUrl = newUrl,
                    Name = newName,
                    Length = formFile.Length,
                    Type = formFile.ContentType

                };
            }
            catch (Exception ex)
            {
                log.LogError(eventCode, ex, ex.StackTrace);

                return new ImageUploadResult
                {
                    ErrorMessage = "There was an error logged during file processing"

                };
            }

            

           
        }
    }
}