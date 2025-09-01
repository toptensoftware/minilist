import { css } from "@codeonlyjs/core";
import { Dialog } from "./Dialog.js";
import { db } from "./Database.js";

export class AddItemDialog extends Dialog
{
    constructor(callback)
    {
        super();
        this.callback = callback;
        this.itemName = "";
        this.separator = false;
    }

    addItem()
    {
        let text = this.itemName.trim();
        if (text != "")
        {
            this.callback({ 
                name: text,
                separator: this.separator,
                count: 1,
                checked: false,
            });
        }
        this.itemName = "";
        this.separator = false;
        this.update();

        // Hackfest because iOS is too stupid to
        // reenable the shift key on an auto-cap input
        // when the field is cleared.
        // Fix is to temporarily move focus to another
        // input and then back again
        let temp = document.createElement("INPUT");
        temp.style.opacity = "0.0";
        temp.style.position = "absolute";
        this.elItemName.parentNode.appendChild(temp);
        temp.focus();
        setTimeout(() => {
            this.elItemName.focus();
            temp.remove();
        }, 0);
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
                input: "itemName",
                on_keypress: "onKeyPress",
                bind: "elItemName",

            },
            {
                type: "div .options",
                $: {
                    type: "label",
                    $: [
                        { 
                            type: "input type=checkbox .switch",
                            input: "separator",
                            bind: "chkSeparator",
                        },
                        "Separator"
                    ],
                }
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

    .options
    {
        text-align: center;
        padding-top: 20px;
    }
}
`;
