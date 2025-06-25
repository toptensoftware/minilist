import { Component, css, html } from "@codeonlyjs/core";
import { config } from "./config.js";
import { NewListDialog } from "./NewListDialog.js";

// The main footer
export class HomeFooter extends Component
{
    onNewList()
    {
        let dlg = new NewListDialog();
        dlg.showModal();
    }

    static template = {
        type: "footer #footer",
        $: [
            {
                type: "div .buttons-left",
                $: [
                    {
                        type: "button",
                        $: "Edit",
                    }
                ]
            },
            {
                type: "div .buttons-right",
                $: [
                    {
                        type: "button",
                        $: "New List",
                        on_click: "onNewList",
                    },
                ]
            }
        ]
    }
}

css`
:root
{
    --footer-height: 50px;
}

#footer
{
    position: fixed;
    bottom: 0;
    width: 100%;
    height: var(--footer-height);

    display: flex;
    justify-content: start;
    align-items: center;
    border-top: 1px solid var(--gridline-color);
    padding-left: 10px;
    padding-right: 10px;
    background-color: rgb(from var(--back-color) r g b / 75%);
    z-index: 1;

    .buttons-left
    {
        flex-grow: 1;
        font-size: 12pt;
        display: flex;
        gap: 10px;
        align-items: center;
    }
    .buttons-right
    {
        font-size: 12pt;
        display: flex;
        gap: 10px;
        align-items: center;
    }

}
`