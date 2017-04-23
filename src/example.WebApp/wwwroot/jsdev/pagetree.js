﻿$(function () {
    var pageTree = {
        ui: {
            treeDiv: $('#tree1'),
            cmdBarDiv: $('#cmdBar'),
            selectedPageInput: $('#hdnSelPage'),
            cmdHeading: $('#cmdHeading'),
            sortLi: $('#liSort'),
            editLi: $('#liEdit'),
            deleteLi: $('#liDelete'),
            newChildLi: $('#liNewChild'),
            editLink: $('#lnkEdit'),
            viewLink: $('#lnkView'),
            sortButton: $('#lnkSort'),
            newChildLink: $('#lnkNewChild'),
            deleteButton: $('#lnkDeletePage'),
            pubStatusLabel: $('#spnPubStatus')
        },
        urls: {
            treeDataUrl: $('#config').data("service-url"),
            sortUrl: $('#config').data("sort-url"),
            moveUrl: $('#config').data("move-url"),
            deleteUrl: $('#config').data("delete-url"),
            editUrl: $('#config').data("edit-url")
        },
        xsrfToken: $('[name="__RequestVerificationToken"]:first').val(),
        showCommands : function (node) {
            pageTree.ui.selectedPageInput.val(node.id);
            pageTree.ui.cmdHeading.html(node.name);
            pageTree.ui.editLink.attr('href', this.urls.editUrl + '/' + node.slug);
            pageTree.ui.viewLink.attr('href', node.url);
            pageTree.ui.newChildLink.attr('href', this.urls.editUrl + "?parentslug=" + node.slug);
            pageTree.ui.pubStatusLabel.html(node.pubstatus);
            pageTree.ui.cmdBarDiv.show();
            new Tether({
                element: '.commandPanel',
                target: '.jqtree-selected',
                attachment: 'top left',
                targetAttachment: 'top right'
            });
            if (node.childcount > 1) {
                pageTree.ui.sortLi.show();
            } else {
                pageTree.ui.sortLi.hide();
            };
            if (node.canEdit) {
                pageTree.ui.editLi.show();  
            } else {
                pageTree.ui.editLi.hide();
            };
            if (node.canDelete) {
                pageTree.ui.deleteLi.show();
            } else {
                pageTree.ui.deleteLi.hide();
            };
            if (node.canCreateChild) {
                pageTree.ui.newChildLi.show();
            } else {
                pageTree.ui.newChildLi.hide();
            };
        },
        moveNode : function (movedNode, targetNode, previousParent, position) {
            var obj = {};
            obj['movedNode'] = movedNode.id;
            obj['targetNode'] = targetNode.id;
            obj['previousParent'] = previousParent.id;
            obj['position'] = position;
            var moveResult = false;
            $.ajax({
                type: "POST",
                url: pageTree.urls.moveUrl,
                async: false,
                headers: { 'X-XSRF-TOKEN': this.xsrfToken },
                dataType: "json",
                data: obj,
                success: function (data, textStatus, jqXHR) {
                    if (data.success) { moveResult = true; } else {
                        alert(data.message);
                    }
                },
                complete: function (jqXHR, textStatus) {

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert(errorThrown);
                }
            });
            return moveResult;
        },
        init: function () {
            this.ui.sortButton.click(function (e) {
                e.preventDefault();
                if (confirm('Are you sure you want to sort the child pages alphabetically?')) {
                    var node = pageTree.ui.treeDiv.tree('getNodeById', pageTree.ui.selectedPageInput.val());
                    var objSort = {};
                    objSort['pageId'] = node.id;
                    $.ajax({
                        type: "POST",
                        url: pageTree.urls.sortUrl,
                        headers: {'X-XSRF-TOKEN': pageTree.xsrfToken },
                        async: false,
                        processData: true,
                        dataType: "json",
                        data: objSort,
                        success: function (data, textStatus, jqXHR) {
                            if (data.success) {
                                pageTree.ui.treeDiv.tree('loadDataFromUrl', node);
                            } else {
                                alert(data.message);
                            }
                        }, 
                        complete: function (jqXHR, textStatus) {

                        },  
                        error: function (jqXHR, textStatus, errorThrown) {
                            alert(errorThrown);
                        }
                    });  
                }  
            }); // end sortbutton click

            pageTree.ui.deleteButton.click(function (e) {
                e.preventDefault();
                var node = pageTree.ui.treeDiv.tree('getNodeById', pageTree.ui.selectedPageInput.val());
                var doDelete = false;
                if (node.childcount > 0) {
                    if (confirm("Are you sure you want to delete the page and all of it's child pages?")) {
                        doDelete = true;
                    }
                } else {
                    if (confirm("Are you sure you want to delete the page?")) {
                        doDelete = true;
                    }
                }
                if (doDelete) {
                    var objDel = {};
                    objDel['id'] = node.id;
                    $.ajax({
                        type: "POST",
                        url: pageTree.urls.deleteUrl,
                        headers: { 'X-XSRF-TOKEN': pageTree.xsrfToken },
                        async: false,
                        dataType: "json",
                        data: objDel,
                        success: function (data, textStatus, jqXHR) {
                            if (data.success) {
                                pageTree.ui.treeDiv.tree('removeNode', node);
                            } else {
                                alert(data.message);
                            }
                        },
                        complete: function (jqXHR, textStatus) {

                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            alert(textStatus);
                        }
                    });
                }
            }); // end delete click

            pageTree.ui.treeDiv.tree({
                dataUrl: pageTree.urls.treeDataUrl
                , dragAndDrop: true
                , onLoadFailed: function (response) {
                    alert(response);
                }
            });
            pageTree.ui.treeDiv.bind(
                'tree.click',
                function (event) {
                    var node = event.node;
                }
            );
            pageTree.ui.treeDiv.bind(
                'tree.dblclick',
                function (event) {
                    console.log(e.node);
                }
            );
            pageTree.ui.treeDiv.bind(
                'tree.select',
                function (event) {
                    if (event.node) {
                        pageTree.showCommands(event.node);
                    } else {
                        // event.node is null
                        // a node was deselected
                        // e.previous_node contains the deselected node
                        var node = event.previous_node;
                        pageTree.ui.selectedPageInput.val(-1);
                        pageTree.ui.cmdBarDiv.hide();
                    }
                }
            );
            pageTree.ui.treeDiv.bind(
                'tree.contextmenu',
                function (event) {
                    var node = event.node;
                }
            );
            pageTree.ui.treeDiv.bind(
                'tree.move',
                function (event) {
                    event.preventDefault();
                    if (confirm('are you sure you want to move the node')) {
                        // if did move it on the server
                        if (pageTree.moveNode(event.move_info.moved_node, event.move_info.target_node, event.move_info.previous_parent, event.move_info.position)) {
                            event.move_info.do_move(); // this moves it in the ui
                        }
                    }
                }
            );
            pageTree.ui.treeDiv.bind(
                'tree.init',
                function () {
                }
            );
            pageTree.ui.treeDiv.bind(
                'tree.open',
                function (event) {

                    pageTree.ui.treeDiv.tree('selectNode', null);
                    pageTree.ui.treeDiv.tree('selectNode', event.node);
                }
            );
            pageTree.ui.treeDiv.bind(
                'tree.close',
                function (event) {
                    pageTree.ui.treeDiv.tree('selectNode', null);
                    pageTree.ui.treeDiv.tree('selectNode', event.node);
                }
            );

        } // end init
    };
    pageTree.init();
}); 