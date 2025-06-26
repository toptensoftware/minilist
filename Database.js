import { notify } from "@codeonlyjs/core";

class Database
{
    constructor()
    {
        // Create empty lists in the correct order
        this.#lists = JSON.parse(localStorage.getItem("order.json") ?? "[]").map(x => ( { 
            name: x,
            count: 0, 
            checked: 0
        }));

        // Read each list and update the item counts
        for (let i = 0; i< localStorage.length; i++)
        {
            // Get key and check if it's a list
            let key = localStorage.key(i);
            if (!key.endsWith(".list"))
                continue;

            // Load the list
            let list = JSON.parse(localStorage.getItem(key));

            // Make sure the name matches the key
            list.name = key.substring(0, key.length - 5);

            // Update the index
            this.saveList(list, true);
        }
    }

    #lists;

    findListIndex(listname)
    {
        for (let i=0; i<this.#lists.length; i++)
        {
            if (this.#lists[i].name == listname)
                return i;
        }
        return -1;
    }

    saveList(list, loading)
    {
        // Get counts
        let count = list.items.length;
        let checked = list.items.filter(x => x.checked).length;

        // Find existing list entry, or create a new one
        let index = this.findListIndex(list.name);
        if (index < 0)
        {
            this.#lists.push({
                name: list.name,
                count,
                checked,
            })
        }
        else
        {
            this.#lists[index].count = count;
            this.#lists[index].checked = checked;
        }

        if (!loading)
        {
            // Save the list
            localStorage.setItem(`${list.name}.list`, JSON.stringify(list));

            this.saveOrder();
            
            // Fire event
            this.onListsChanged();
        }
    }

    saveOrder()
    {
            // Save the order
            localStorage.setItem(`order.json`, JSON.stringify(this.#lists.map(x => x.name)));
    }

    get lists()
    {
        return this.#lists;
    }

    createList(listname)
    {
        // Check doesn't already exist
        if (this.#lists.some(x => x.name == listname))
            return;

        // Save new list
        this.saveList({
            name: listname,
            items: [],
        });
    }

    deleteList(listname)
    {
        // Remove from index
        this.#lists = this.#lists.filter(x => x.name != listname);
        this.saveOrder();

        // Remove from storage
        localStorage.removeItem(`${listname}.list`);

        // Fire
        this.onListsChanged();
    }

    moveList(fromIndex, toIndex)
    {
        let list = this.#lists[fromIndex];
        this.#lists.splice(fromIndex, 1);
        this.#lists.splice(toIndex, 0, list);
        this.saveOrder();
        this.onListsChanged();
    }

    onListsChanged()
    {
        notify("reloadLists");
    }

    getList(listname)
    {
        let list = JSON.parse(localStorage.getItem(`${listname}.list`));
        return list;
    }
}

export let db = new Database();