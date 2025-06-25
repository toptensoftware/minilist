import { css } from "@codeonlyjs/core";
import { Dialog } from "./Dialog.js";

export class NewListDialog extends Dialog
{
    // This template will be "re-templated" by the base Dialog class
    // to wrap it in <dialog>, <form> etc...
    static template = {
        title: "Create a New List",
        id: "new-list-dialog",
        content: {
            type: "input type=text",
            placeholder: "Enter name of new list",
        },
        footer: [
            {
                type: "button",
                $: "Create",
                class: "accent",
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
#new-list-dialog
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
