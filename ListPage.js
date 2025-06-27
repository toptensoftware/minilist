import { Component, css, router, html, notify } from "@codeonlyjs/core";
import { config } from "./config.js";
import { db } from "./Database.js";
import { DragHandler } from "./DragHandler.js";
import { AddItemDialog } from "./AddItemDialog.js";
import { EditItemDialog } from "./EditItemDialog.js";

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
        this.listen(notify, this.#list);
    }

    #list;
    #dragHandler;

    getItemsFiltered()
    {
        switch (this.#list.mode ?? "all")
        {
            case "all": 
                return this.#list.items;

            case "todo":
                return this.#list.items.filter(x => !x.checked);

            case "done":
                return this.#list.items.filter(x => x.checked);
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

    onItemClick(item, ev)
    {
        if (!this.editMode)
        {
            db.toggleItemChecked(this.#list, item);
            return;
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

    get viewMode()
    {
        return this.#list.mode;
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
                    class_checked: i => i.checked,
                    "data-name": i => i.name,
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
                            $: i => i.name,
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
                                class_accent: c => c.editMode,
                                on_click: "onEdit",
                            }
                        ]
                    },
                    {
                        type: "div .buttons-center .control-group",
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
                        type: "div .buttons-right",
                        $: [
                            {
                                type: "button",
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
        z-index: 1;

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
        }
        .back
        {
            z-index: 1;
            color: var(--body-text-color);
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
        let list = db.getList(to.match.groups.listname);
        to.page = new ListPage(list);
        return true;
    },
});