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
            $: {
                foreach: {
                    items: c => c.items,
                },
                type: "div",
                class: "list-item",
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
            }
        },
        HomeFooter
    ]
}

css`
main
{
    padding-top: var(--header-height);
    padding-bottom: var(--footer-height);

    .list-item
    {
        padding: 5px;
        user-select: none; 

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

        border-bottom: 1px solid var(--gridline-color);
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