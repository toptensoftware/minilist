import { Component, css, router, html, notify } from "@codeonlyjs/core";
import { config } from "./config.js";
import { db } from "./Database.js";
import { DragHandler } from "./DragHandler.js";
import { AddItemDialog } from "./AddItemDialog.js";

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
            moveItem: (from, to) => db.moveItemInList(this.#list, from, to),
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
                        text: "< Back"
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
                        items: c => c.list.items,
                    },
                    type: "div",
                    class: "list-item",
                    "data-name": i => i.name,
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
                            type: "div",
                            class: "body",
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
                        type: "div .buttons-right",
                        $: [
                            {
                                type: "button",
                                $: "New Item",
                                on_click: "onNewItem",
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
        position: relative;

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
            padding: 5px;
            user-select: none; 

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
                padding: 9px 12px 0 12px;
                img
                {
                    width: 25px;
                    height: 25px;
                }
            }

            .move-handle
            {
                display: none;
                padding: 9px 12px 0 12px;
                touch-action: none;
                img
                {
                    width: 45px;
                    height: 45px;
                }
            }

            .body
            {
                color: var(--body-text-color);
                flex-grow: 1;
                h3 
                { 
                    margin: 0; 
                    padding: 0;
                    font-size: 1rem;
                    color: var(--accent-color);
                }
                
                .counts
                {
                }
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
                    display: block;
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

        .buttons-left
        {
            flex-grow: 1;
            font-size: 12pt;
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .buttons-right
        {
            font-size: 12pt;
            display: flex;
            gap: 10px;
            align-items: center;
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