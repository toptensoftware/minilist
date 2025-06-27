import { css } from "@codeonlyjs/core";
import { Dialog } from "./Dialog.js";
import { db } from "./Database.js";

export class EditListDialog extends Dialog
{
    constructor(listname)
    {
        super();
        this.listname = listname;
        this.create();
        this.elListName.selectionStart = this.elListName.selectionEnd = this.elListName.value.length;
    }

    onSave(ev)
    {
        try
        {
            db.renameList(this.listname, this.elListName.value);
        }
        catch (err)
        {
            alert(err.message);
            ev.preventDefault();
        }
    }

    // This template will be "re-templated" by the base Dialog class
    // to wrap it in <dialog>, <form> etc...
    static template = {
        title: "Rename List",
        id: "edit-list-dialog",
        content: {
            type: "input type=text",
            placeholder: "Enter name of list",
            bind: "elListName",
            value: c => c.listname,
        },
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
#edit-list-dialog
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
