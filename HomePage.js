import { Component, css, router, html, notify } from "@codeonlyjs/core";
import { config } from "./config.js";
import { db } from "./Database.js";
import { DragHandler } from "./DragHandler.js";
import { NewListDialog } from "./NewListDialog.js";

export class HomePage extends Component
{
    constructor()
    {
        super();
        this.listen(notify, "reloadLists")
        this.create();
        this.#dragHandler = new DragHandler({
            elList: this.list,
            selItem: ".list-item",
            selHandle: ".move-handle",
            moveItem: (from, to) => db.moveList(from, to),
            getScrollBounds: () => ({
                top: this.main.querySelector("header").getBoundingClientRect().bottom,
                bottom: this.main.querySelector("footer").getBoundingClientRect().top,
            })
        });
        this.editMode = false;
    }

    #dragHandler;

    onNewList()
    {
        let dlg = new NewListDialog();
        dlg.showModal();
    }

    onEdit()
    {
        this.editMode = !this.editMode;
        this.invalidate();
    }


    static format_counts(list)
    {
        if (list.checked)
        {
            return `${list.count - list.checked} of ${list.count} remaining`;
        }
        else
        {
            return `${list.count} items`;
        }
    }

    static template = {
        type: "main #home",
        bind: "main",
        "class_edit-mode": c => c.editMode,
        $: [
            {
                type: "header",
                $: [
                    {
                        type: "span .title",
                        $: [
                            { 
                                type: "img", 
                                src: "/public/logo.svg",
                            },
                            config.appName + " ",
                            {
                                type: "a",
                                href: "#",
                                on_click: () => window.location.reload(),
                                text: " v0.0.17",
                            }
                        ]
                    },
                    {
                        type: "div .buttons",
                        $: [
                            {
                                type: "input type=checkbox .theme-switch",
                                on_click: () => window.stylish.toggleTheme(),
                            },
                            {
                                // Initialize the state of the theme-switch.
                                // We do this as early as possible to prevent it flicking on/off as page hydrates.
                                type: "script",
                                text: html(`document.querySelector(".theme-switch").checked = window.stylish.darkMode;`),
                            }                    
                        ]
                    }
                ]
            },
            {
                type: "div .list",
                bind: "list",
                $: {
                    foreach: {
                        items: c => db.lists,
                        itemKey: i => i.name,
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
                            on_click: i => db.deleteList(i.name),
                        },
                        {
                            type: "a",
                            class: "body",
                            href: i => `/list/${i.name}`,
                            $: [
                                {
                                    type: "h3",
                                    $: i => i.name,
                                },
                                {
                                    type: "div",
                                    class: "counts",
                                    $: i => HomePage.format_counts(i),
                                }  
                            ]
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
                                $: "New List",
                                on_click: "onNewList",
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

#home
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
            flex-grow: 1;
            display: flex;
            gap: 3px;
            align-items: center;
            color: var(--body-fore-color);

            img
            {
                height: calc(var(--header-height) - 25px);
                padding-right: 10px
            }
        }


        .buttons
        {
            font-size: 12pt;
            display: flex;
            gap: 10px;
            align-items: center;

            .theme-switch
            {
                transform: translateY(-1.5px);
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
    pattern: "/",
    match: (to) => {
        to.page = new HomePage();
        return true;
    },
});