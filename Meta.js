import { Component, router, $ } from "@codeonlyjs/core";
import { config } from "./config.js"

export class Meta extends Component
{
    constructor()
    {
        super();

        router.addEventListener("didEnter", (from, to) => {
            this.invalidate();
            if (coenv.browser)
                document.title = this.title;
        });
    }

    get title()
    {
        if (router.current?.title)
            return `${router.current.title} - ${config.appName}`;
        else
            return config.appName;
    }

    get name()
    {
        return config.appName;
    }

    get description()
    {
        return config.description;
    }

    get url()
    {
        return router.current?.url.href ?? "";
    }

    get image()
    {
        return null;
    }

    static template = [

        // Standard
        $.title(c => c.title),
        $.meta.name("description").content(c => c.description),
        
    ]
}
