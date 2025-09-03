import { notify } from "@codeonlyjs/core";

class Database
{
    constructor()
    {
        // Create empty lists in the correct order
        this.#index = JSON.parse(localStorage.getItem("order.json") ?? "[]").map(x => ( { 
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

            // Update index, save and notify
            this.updateIndex(list);
        }
    }

    #index;

    findListIndex(listname)
    {
        for (let i=0; i<this.#index.length; i++)
        {
            if (this.#index[i].name == listname)
                return i;
        }
        return -1;
    }


    saveOrder()
    {
        // Save the order
        localStorage.setItem(`order.json`, JSON.stringify(this.#index.map(x => x.name)));
    }

    get lists()
    {
        return this.#index;
    }

    createList(listname)
    {
        // Check doesn't already exist
        if (this.#index.some(x => x.name == listname))
            return;

        // Create list index entry
        let indexEntry = {
            name: listname,
            count: 0,
            checked: 0,
        };
        this.#index.push(indexEntry);
        this.saveOrder();

        // Create the list itself
        let list = {
            name: listname,
            items: [],
            viewMode: "all",
        }
        this.saveList(list);

        // Notify
        this.onListsChanged();
    }

    deleteList(listname)
    {
        // Remove from index
        this.#index = this.#index.filter(x => x.name != listname);
        this.saveOrder();

        // Remove from storage
        localStorage.removeItem(`${listname}.list`);

        // Fire
        this.onListsChanged();
    }

    moveList(fromIndex, toIndex)
    {
        let list = this.#index[fromIndex];
        this.#index.splice(fromIndex, 1);
        this.#index.splice(toIndex, 0, list);
        this.saveOrder();
        this.onListsChanged();
    }

    renameList(from, to)
    {
        // Redundant?
        if (from == to)
            return;

        // Check if a list with this name already exists
        if (this.#index.some(x => x.name == to))
            throw new Error("A list with this name already exists");

        // Find the list in the index
        let listIndex = this.findListIndex(from);
        if (listIndex < 0)
            return;

        // Load the list and update its internal name
        let list = this.getList(from);
        list.name = to;
        this.saveList(list);

        // Remove the old list from storage
        localStorage.removeItem(`${from}.list`);

        // Update the index
        this.#index[listIndex].name = to;

        // Save and fire
        this.saveOrder();
        this.onListsChanged();
    }

    onListsChanged()
    {
        notify("reloadLists");
    }

    updateIndex(list)
    {
        // Find the index entry for this list
        let listIndex = this.findListIndex(list.name);
        if (listIndex < 0)
            return;

        // Update counts
        let index = this.#index[listIndex];
        index.count = 0;
        index.checked = 0;
        for (let i=0; i<list.items.length; i++)
        {
            let item = list.items[i];
            if (item.separator)
                continue;
            if (item.count == 0)
                continue;

            index.count++;
            if (item.checked)
                index.checked++;
        }

        this.onListsChanged();
    }

    getList(listname)
    {
        let list = JSON.parse(localStorage.getItem(`${listname}.list`));

        // Check all items have an id
        for (let i=0; i<list.items.length; i++)
        {
            if (!list.items[i].id)
                list.items[i].id = allocateItemId(list);
        }

        return list;
    }

    addItemsToList(list, items)
    {
        for (let i=0; i<items.length; i++)
        {
            let item = items[i];
            item.id = allocateItemId(list);
            list.items.push(item);
        }

        // Update index, save and notify
        this.updateIndex(list);
        this.saveList(list);
    }

    addItemToList(list, item, position)
    {
        // Work out next id
        item.id = allocateItemId(list);
        if (position !== undefined)
        {
            list.items.splice(position, 0, item);
        }
        else
        {
            list.items.push(item);
        }

        // Update index, save and notify
        this.updateIndex(list);
        this.saveList(list);
    }

    deleteItemFromList(list, item)
    {
        // Find list item
        let index = list.items.indexOf(item);
        if (index < 0)
            return;

        // Remove from list
        list.items.splice(index, 1);

        // Update index, save and notify
        this.updateIndex(list);
        this.saveList(list);
    }

    deleteCheckedItemsFromList(list)
    {
        list.items = list.items.filter(x => !x.checked);
        this.updateIndex(list);
        this.saveList(list);
    }

    moveItemInList(list, fromIndex, toIndex)
    {
        let item = list.items[fromIndex];
        list.items.splice(fromIndex, 1);
        list.items.splice(toIndex, 0, item);

        // Save and notify
        this.saveList(list);
    }

    toggleItemChecked(list, item)
    {
        // Can't toggle separators
        if (item.separator)
            return;

        // Toggle check
        item.checked = !item.checked;

        // Update index, save and notify
        this.updateIndex(list);
        this.saveList(list);
    }

    updateItem(list, item, newItem)
    {
        // Switching between separator and non-separator
        if (item.separator != newItem.separator)
        {
            // Get index entry
            let listIndex = this.findListIndex(list.name);
            if (listIndex < 0)
                return;

            // Handle checked item being converted to separator
            if (newItem.separator && item.checked)
            {
                item.checked = false;
            }

            // Update item separator flag
            item.separator = newItem.separator;

            // Force count to 0 if separator
            if (item.separator)
                item.count = 0;
        }


        // Update item name
        item.name = newItem.name;
        
        // Update index, save and notify
        this.updateIndex(list);
        this.saveList(list);
    }

    setItemCount(list, item, count)
    {
        // Can't turn separators on/off
        if (item.separator)
            return;

        // Update the count
        item.count = count;

        // Update index, save and notify
        this.updateIndex(list);
        this.saveList(list);
    }

    setItemCountAll(list, count)
    {

        for (let i=0; i<list.items.length; i++)
        {
            let item = list.items[i];

            // Can't turn separators on/off
            if (!item.separator)
            {
                item.count = count;
                item.checked = false;
            }
        }

        // Update index, save and notify
        this.updateIndex(list);
        this.saveList(list);
    }

    setListViewMode(list, mode)
    {
        if (list.mode == mode)
            return;

        list.mode = mode;
        this.saveList(list);
    }

    saveList(list)
    {
        // Save list
        localStorage.setItem(`${list.name}.list`, JSON.stringify(list));

        // Notify
        notify(list);
    }
}

export let db = new Database();


function allocateItemId(list)
{
    // Work out next id
    let id = list.items.length;
    while (list.items.some(x => x.id == id))
        id++;
    return id;
}

