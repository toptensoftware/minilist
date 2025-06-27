import { Component, css } from "@codeonlyjs/core";

export class Dialog extends Component
{
    showModal()
    {
        // Add dialog to the document and show it
        document.body.appendChild(this.domTree.rootNode);
        this.domTree.rootNode.showModal();

        // Remove from document when closed
        this.domTree.rootNode.addEventListener("close", () => {
            this.domTree.rootNode.remove();
        });
    }

    // Override to wrap template in dialog frame
    static onProvideTemplate()
    {
        return {
            type: "dialog",
            class: "dialog",
            id: this.template.id,
            $: {
                type: "form",
                method: "dialog",
                $: [
                    {
                        type: "header",
                        $: this.template.title,
                    },
                    {
                        type: "main",
                        $: this.template.content, 
                    },
                    {
                        type: "footer",
                        $: this.template.footer,
                    },
                ]
            }
        };
    }
}

// Styling common to all dialogs
css`
dialog.dialog
{
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    padding: 0;
    margin: 0;
    border: none;
    border-radius: 0;
    header
    {
        padding: 10px;
    }
    footer
    {
        justify-content: center;
    }
}
`;

