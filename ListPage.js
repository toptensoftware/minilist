import { Component, css, router, html, notify, $ } from "@codeonlyjs/core";
import { config } from "./config.js";
import { db } from "./Database.js";
import { DragHandler } from "./DragHandler.js";
import { AddItemDialog } from "./AddItemDialog.js";
import { EditItemDialog } from "./EditItemDialog.js";
import { positionPopover } from "./positionPopover.js";
import { formatText, parseText } from "./TextFormat.js";

export class ListPage extends Component
{
    constructor(list)
    {
        super();
        this.#list = list;
        this.create();
        this.#dragHandler = new DragHandler({
            elList: this.elList,
            selItem: ".list-item",
            selHandle: ".move-handle",
            moveItem: (from, to) => db.moveItemInList(this.#list, this.mapViewIndex(from), this.mapViewIndex(to)),
            getScrollBounds: () => ({
                top: this.elMain.querySelector("header").getBoundingClientRect().bottom,
                bottom: this.elMain.querySelector("footer").getBoundingClientRect().top,
            })
        });
        this.editMode = false;
        this.pickMode = false;
        this.listen(notify, this.#list);
    }

    #list;
    #dragHandler;

    getItemsFiltered()
    {
        if (this.pickMode)
            return this.#list.items;

        let pickedItems = this.#list.items.filter(x => x.separator || x.count > 0);

        switch (this.#list.mode ?? "all")
        {
            case "all": 
            {
                if (pickedItems.length < this.#list.items.length)
                    return removeRedundantSeparators(pickedItems);
                else
                    return pickedItems;
            }

            case "todo":
                return removeRedundantSeparators(pickedItems.filter(x => x.separator || !x.checked));

            case "done":
                return removeRedundantSeparators(pickedItems.filter(x => x.separator || x.checked));
        }

        function removeRedundantSeparators(arr)
        {
            for (let i=0; i<arr.length; i++)
            {
                if (arr[i].separator)
                {
                    if (i + 1 == arr.length || arr[i+1].separator)
                    {
                        arr.splice(i, 1);
                        i--;
                    }
                }
            }
            return arr;
        }
    }

    onEdit()
    {
        this.editMode = !this.editMode;
        this.invalidate();
    }

    onNewItem()
    {
        let dlg = new AddItemDialog((item) => {
            db.addItemToList(this.#list, item);
        });
        dlg.showModal();
    }

    onDeleteItem(item, ev)
    {
        db.deleteItemFromList(this.#list, item);
    }

    getItemChecked(item)
    {
        if (this.pickMode)
        {
            return item.count > 0;
        }
        else
        {
            return item.checked;
        }
    }

    onItemClick(item, ev)
    {
        if (!this.editMode)
        {
            if (this.pickMode)
            {
                if (ev.target.closest(".checkmark"))
                {
                    db.setItemCount(this.#list, item, item.count == 0 ? 1 : 0);
                }
                else
                {
                    db.setItemCount(this.#list, item, item.count + 1);
                }
            }
            else
            {
                db.toggleItemChecked(this.#list, item);
            }
        }
        else
        {
            if (!ev.target.closest(".body"))
                return;

            let elItem = ev.target.closest(".list-item");
            if (!elItem)
                return;

            ev.preventDefault();

            let dlg = new EditItemDialog(this.#list, item);
            dlg.showModal();
        }
    }

    async onMenuCommand(ev)
    {
        switch (ev.target.id)
        {
            case "pick-items":
                this.pickMode = !this.pickMode;
                this.invalidate();
                break;

            case "select-all":
                db.setItemCountAll(this.#list, 1);
                break;

            case "clear-all":
                db.setItemCountAll(this.#list, 0);
                break;

            case "paste-items":
                let items = parseText(await navigator.clipboard.readText());
                db.addItemsToList(this.#list, items);
                break;

            case "copy-items":
                navigator.clipboard.writeText(formatText(this.getItemsFiltered()));
                break;
        }
    }

    onFinishPicking()
    {
        this.pickMode = false;
        this.invalidate();
    }

    get viewMode()
    {
        return this.#list.mode ?? "all";
    }
    
    set viewMode(mode)
    {
        db.setListViewMode(this.#list, mode);
    }

    mapViewIndex(index)
    {
        switch (this.viewMode)
        {
            case "all":
                return index;

            case "todo":
            case "done":
                let filtered = this.getItemsFiltered();
                let item = filtered[index];
                return this.#list.items.indexOf(item);                
        }

    }
    

    get pageTitle() { return this.#list.name; }
    get list() { return this.#list; }


    static template = {
        type: "main #list",
        bind: "elMain",
        "class_edit-mode": c => c.editMode,
        "class_pick-mode": c => c.pickMode,
        $: [
            {
                type: "header",
                $: [
                    {
                        type: "a .back",
                        href: "/",
                        text: html("〈 &nbsp;&nbsp;"),
                    },
                    {
                        type: "div .title",
                        text: c => c.pageTitle,
                    },
                    {
                        type: "button .subtle",
                        popovertarget: "menu-popover",
                        $: [
                            "☰",
                            {
                                type: "nav .menu popover='' data-auto-close=1",
                                id: "menu-popover",
                                bind: "popover",
                                on_toggle: (c, ev) => positionPopover(ev),
                                on_click: "onMenuCommand",
                                $: [
                                    $.a(c => c.pickMode ? "Finish Picking" : "Pick Items").id("pick-items"),
                                    $.hr().display(c => c.pickMode),
                                    $.a("Clear All").id("clear-all").display(c => c.pickMode),
                                    $.a("Select All").id("select-all").display(c => c.pickMode),
                                    $.hr(),
                                    $.a("Paste Items").id("paste-items"),
                                    $.a("Copy Items").id("copy-items"),
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                type: "div .list",
                bind: "elList",
                $: {
                    foreach: {
                        items: c => c.getItemsFiltered(),
                        itemKey: i => i.id,
                    },
                    type: "div",
                    class: "list-item",
                    class_checked: (i, ctx) => ctx.outer.model.getItemChecked(i),
                    class_separator: i => i.separator,
                    on_click: (i, ev, ctx) => ctx.outer.model.onItemClick(i, ev),
                    $: [
                        {
                            type: "div",
                            class: "del-button",
                            $: {
                                type: "img",
                                src: "/public/DeleteIcon.svg",
                            },
                            on_click: (i, ev, ctx) => ctx.outer.model.onDeleteItem(i, ev),
                        },
                        {
                            type: "div .checkmark",
                            $: {
                                type: "img",
                                src: "/public/Checkmark.svg",
                            },
                        },
                        {
                            type: "div .body",
                            $: i => formatItemCount(i),
                        },
                        {
                            type: "div",
                            class: "move-handle",
                            $: {
                                type: "img",
                                src: "/public/MoveHandle.svg",
                            },
                        },
                    ]
                }
            },
            {
                type: "footer",
                $: [
                    {
                        type: "div .buttons-left",
                        $: [
                            {
                                type: "button",
                                $: c => c.editMode ? "Done" : "Edit",
                                class_subtle: c => !c.editMode,
                                class_accent: c => c.editMode,
                                on_click: "onEdit",
                            }
                        ]
                    },
                    {
                        type: "div .buttons-center .control-group",
                        if: c => !c.pickMode,
                        $: [
                            { type: "input .button #all name=mode type=radio value=all", input: "viewMode" }, 
                            { type: "label", for:"all", $: "All" },
                            { type: "input .button #todo name=mode type=radio value=todo", input: "viewMode" }, 
                            { type: "label", for:"todo", $: "To Do" },
                            { type: "input .button #done name=mode type=radio value=done", input: "viewMode" }, 
                            { type: "label", for:"done", $: "Done" },
                        ]
                    },
                    {
                        type: "div .buttons-center",
                        else: true,
                        $: {
                            type: "button .accent",
                            text: "Finish Picking",
                            on_click: "onFinishPicking",
                        }
                    },
                    {
                        type: "div .buttons-right",
                        $: [
                            {
                                type: "button .subtle",
                                on_click: "onNewItem",
                                text: "＋",
                            },
                        ]
                    }
                ]
            }
        ]
    }
}

function formatItemCount(item)
{
    if (!item.separator && item.count > 1)
        return `${item.count}x ${item.name}`;
    return item.name;
}

css`
:root
{
    --header-height: 50px;
    --footer-height: 50px;
}

:root.standalone
{
    --footer-height: 90px;

    footer
    {
        padding-bottom: 40px;
    }
}

#list
{
    header
    {
        width: 100%;
        height: var(--header-height);
        position: fixed;
        left: 0;
        top: 0;

        display: flex;
        justify-content: start;
        align-items: center;
        border-bottom: 1px solid var(--gridline-color);
        padding-left: 10px;
        padding-right: 10px;
        background-color: rgb(from var(--back-color) r g b / 75%);

        .title 
        {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: -1;
        }
        .back
        {
            z-index: 1;
            color: var(--body-text-color);
            flex-grow: 1;
        }

        .menu
        {
            border: 1px solid var(--accent-color);
            border-radius: 10px;
            padding: 10px 0;
            text-align: left;
            a
            {
                display: block;
                padding: 10px 20px;
                &:hover
                {
                    background-color: rgb(from var(--fore-color) r g b / 10%);
                    color: unset;
                }
            }
            
        }

    }

    .list
    {
        padding-top: var(--header-height);
        padding-bottom: var(--footer-height);

        &.drag-active
        {
            .list-item:not(.dragging)
            {   
                transition: transform 0.2s ease;
            }
        }

        .list-item
        {
            display: flex;
            flex-direction: row;
            user-select: none; 
            gap: 5px;
            padding-top: 5px;
            padding-bottom: 5px;

            &.dragging
            {
                position: relative;
                background-color: var(--body-back-color);
                z-index: 1;
                border-top: 1px solid var(--gridline-color);
            }

            &.after-gap
            {
                border-top: 1px solid var(--gridline-color);
            }

            &.separator
            {
                background-color: rgb(from var(--accent-color) r g b / 5%);
                .checkmark
                {
                    display: none;
                }
                .body
                {
                    color: var(--accent-color);
                    padding-left: 2px;
                }
            }

            .del-button
            {
                display: none;
                justify-content: center;
                align-items: center;
                padding-left: 5px;
                padding-right: 7px;
                img
                {
                    width: 24px;
                    height: 24px;
                }
            }

            .move-handle
            {
                display: none;
                justify-content: center;
                align-items: center;
                touch-action: none;
                padding-left: 7px;
                padding-right: 7px;
                img
                {
                    width: 24px;
                    height: 24px;
                }
            }
            
            .checkmark
            {
                width: 35px;
                display: flex;
                flex-shrink: 0;
                justify-content: center;
                align-items: center;
                img
                {
                    width: 24px;
                    height: 24px;
                    display: none;
                }
            }

            &.checked
            {
                .checkmark
                {
                    img
                    {
                        display: flex;
                    }
                }
                .body
                {
                    opacity: 50%;
                }
            }

            .body
            {
                color: var(--body-text-color);
                flex-grow: 1;
                border-left: 1px solid var(--account-color);
            }

            border-bottom: 1px solid var(--gridline-color);
            border-top: 1px solid #00000000;
        }
    }

    &.edit-mode
    {
        .list
        {
            .list-item
            {
                .del-button, .move-handle
                {
                    display: flex;
                }
            }
        }
    }

    &.pick-mode
    {
        .list
        {
            .list-item
            {
                .body
                {
                    opacity: 100%;
                }
            }
        }
    }

    &:not(.edit-mode)
    {
        .list
        {
            .list-item.separator
            {
                padding: 0;
                font-size: 0.8rem;
            }
        }
    }


    footer
    {
        width: 100%;
        height: var(--footer-height);
        position: fixed;
        left: 0;
        bottom: 0;

        display: flex;
        justify-content: start;
        align-items: center;
        border-top: 1px solid var(--gridline-color);
        padding-left: 10px;
        padding-right: 10px;
        background-color: rgb(from var(--back-color) r g b / 75%);
        z-index: 1;
        gap: 10px;

        .buttons-left
        {
            font-size: 12pt;
            display: flex;
            align-items: center;
            width: 80px;
        }
        .buttons-center
        {
            flex-grow: 1;
            display: flex;
            justify-content: center;
            label
            {
                font-size: 0.8rem;
                display: inline-block;
                width: 60px;
                text-align: center;
            }
        }
        .buttons-right
        {
            font-size: 12pt;
            display: flex;
            gap: 10px;
            justify-content: right;
            align-items: center;
            width: 80px;
        }
    }
}
`

router.register({
    pattern: "/list/:listname",
    match: (to) => {
        let list = db.getList(decodeURIComponent(to.match.groups.listname));
        to.page = new ListPage(list);
        return true;
    },
});
