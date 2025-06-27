import { css } from "@codeonlyjs/core";
import { Dialog } from "./Dialog.js";
import { db } from "./Database.js";

export class EditItemDialog extends Dialog
{
    constructor(list, item)
    {
        super();
        this.list = list;
        this.item = item;

        this.itemName = item.name;
        this.separator = item.separator;

        this.create();
        //this.elItemName.selectionStart = this.elItemName.selectionEnd = this.elItemName.value.length;
    }

    onSave(ev)
    {
        db.updateItem(this.list, this.item, {
            name: this.itemName, 
            separator: this.separator
        });
    }

    // This template will be "re-templated" by the base Dialog class
    // to wrap it in <dialog>, <form> etc...
    static template = {
        title: "Edit Item",
        id: "edit-item-dialog",
        content: [
            {
                type: "input type=text",
                placeholder: "Enter item",
                input: "itemName",
                value: c => c.item.name,
            },
            {
                type: "div .options",
                $: {
                    type: "label",
                    $: [
                        { 
                            type: "input type=checkbox .switch",
                            input: "separator",
                        },
                        "Separator"
                    ],
                }
            },
        ],
        footer: [
            {
                type: "button",
                $: "Save",
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
    .options
    {
        text-align: center;
        padding-top: 20px;
    }
}
`;
