import { Component, css, router, $ } from "@codeonlyjs/core";
import { config } from "./config.js";
import { HomeHeader } from "./HomeHeader.js";
import { HomeFooter } from "./HomeFooter.js";

export class HomePage extends Component
{
    constructor()
    {
        super();
        this.items = [
            {
                name: "Groceries",
                items: [
                    { name: "Apples", checked: false },
                    { name: "Pears", checked: false },
                    { name: "Bananas", checked: true },
                ]
            },
            {
                name: "Cantabile",
                items: [],
            },
            {
                name: "This Week",
                items: [],
            }
        ]
    }

    onEditMode(ev)
    {
        if (ev.editMode)
            this.main.classList.add("edit-mode");
        else
            this.main.classList.remove('edit-mode');
    }

    static format_counts(list)
    {
        let checked_count = list.items.filter(x => x.checked).length;
        if (checked_count)
        {
            return `${list.items.length - checked_count} of ${list.items.length} remaining`;
        }
        else
        {
            return `${list.items.length} items`;
        }
    }

    static template = [
        HomeHeader,
        {
            type: "main",
            bind: "main",
            $: {
                foreach: {
                    items: c => c.items,
                },
                type: "div",
                class: "list-item",
                $: [
                    {
                        type: "div",
                        class: "del-button",
                        $: {
                            type: "img",
                            src: "/public/DeleteIcon.svg",
                        },
                        on_click: () => alert("del"),
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