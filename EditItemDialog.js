import { css } from "@codeonlyjs/core";
import { Dialog } from "./Dialog.js";
import { db } from "./Database.js";

export class EditItemDialog extends Dialog
{
    constructor(item)
    {
        super();
        this.isNew = item == null;
        this.item = item ?? { name: "", count: 1, checked: false };
    }

    onSave(ev)
    {
        if (this.isNew)
            ev.preventDefault();
    }

    // This template will be "re-templated" by the base Dialog class
    // to wrap it in <dialog>, <form> etc...
    static template = {
        title: this.isNew == null ? "New Item" : "Edit Item",
        id: "edit-item-dialog",
        content: {
            type: "input type=text",
            placeholder: "Enter item",
            bind: "itemname",
        },
        footer: [
            {
                type: "button",
                $: this.isNew ? "Add" : "Save",
                class: "accent",
                on_click: "onSave",
            },
            {
                type: "button",
                $: "Cancel",
            }
        ]
    }
}


// Styling specific to this dialog class
css`
#edit-item-dialog
{
    input[type=text]
    {
        border: none;
        width: 100%;
        box-shadow: none;
        margin: -8px;
        padding-left: 0;
        padding-right: 0;
    }
    button
    {
        display: inline-block;
        width: 120px;
    }
}
`;
