import { Component, css, router, $, notify } from "@codeonlyjs/core";
import { config } from "./config.js";
import { HomeHeader } from "./HomeHeader.js";
import { HomeFooter } from "./HomeFooter.js";
import { db } from "./Database.js";
import { DragHandler } from "./DragHandler.js";

export class HomePage extends Component
{
    constructor()
    {
        super();
        this.listen(notify, "reloadLists")
        this.create();
        this.#dragHandler = new DragHandler({
            elList: this.main,
            selItem: ".list-item",
            selHandle: ".move-handle",
            moveItem: (from, to) => db.moveList(from, to),
        });
    }

    #dragHandler;

    onEditMode(ev)
    {
        if (ev.editMode)
            this.main.classList.add("edit-mode");
        else
            this.main.classList.remove('edit-mode');
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

    static template = [
        HomeHeader,
        {
            type: "main",
            bind: "main",
            $: {
                foreach: {
                    items: c => db.lists,
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
                        type: "div",
                        class: "body",
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
            type: HomeFooter,
            on_editMode: "onEditMode",
        }
    ]
}

css`
main
{
    padding-top: var(--header-height);
    padding-bottom: var(--footer-height);

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

    &.edit-mode
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
`

router.register({
    pattern: "/",
    match: (to) => {
        to.page = new HomePage();
        return true;
    },
});