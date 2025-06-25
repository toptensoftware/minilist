import { css } from "@codeonlyjs/core";
import { Dialog } from "./Dialog.js";

export class NewListDialog extends Dialog
{
    // This template will be "re-templated" by the base Dialog class
    // to wrap it in <dialog>, <form> etc...
    static template = {
        title: "New List",
        id: "new-list-dialog",
        content: {
            type: "input type=text",
            
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
    }
    button
    {
        display: inline-block;
        width: 120px;
    }
}
`;
