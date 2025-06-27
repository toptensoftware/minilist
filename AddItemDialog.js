import { css } from "@codeonlyjs/core";
import { Dialog } from "./Dialog.js";
import { db } from "./Database.js";

export class AddItemDialog extends Dialog
{
    constructor(callback)
    {
        super();
        this.callback = callback;
    }

    addItem()
    {
        let text = this.itemname.value.trim();
        if (text != "")
        {
            this.callback({ 
                name: text,
                count: 1,
                checked: false,
            });
        }
        this.itemname.value = "";
    }

    onSave(ev)
    {
        this.addItem();
    }

    onKeyPress(ev)
    {
        if ((ev.key ?? ev.code) == "Enter")
        {
            this.addItem();
            ev.preventDefault();
            return false;
        }
    }

    static template = {
        title: "Add Item",
        id: "add-item-dialog",
        content: [
            {
                type: "input type=text",
                placeholder: "Enter item",
                bind: "itemname",
                on_keypress: "onKeyPress",

            },
            {
                type: "div .tip",
                text: "Tap return to add consecutive items",
            }
        ],
        footer: [
            {
                type: "button",
                $: "Done",
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
#add-item-dialog
{
    div.tip
    {
        margin: 30px 20px 20px 20px;
        padding: 10px;
        border-radius: 10px;
        text-align: center;
        background-color: rgb(from var(--body-fore-color) r g b / 5%);
    }

    input[type=text]
    {
        border: none;
        width: 100%;
        box-shadow: none;
    }
    button
    {
        display: inline-block;
        width: 120px;
    }
}
`;
