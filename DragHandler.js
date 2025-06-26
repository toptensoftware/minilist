export class DragHandler
{
    // options.elList - the element containing all the items
    // options.selItem - selector for selecting items in the list
    // options.selHandle - selector to match pointer clicks to handle
    constructor(options)
    {
        this.options = options;
        this.options.elList.addEventListener("pointerdown", this.onPointerDown.bind(this));
    }

    onPointerDown(ev)
    {
        // Is it on a handle
        let handle = ev.target.closest(this.options.selHandle);
        if (!handle)
            return;

        // Get the list item
        let item = handle.closest(this.options.selItem);
        if (!item)
        {
            console.error("click on handle didn't match an enclosing item");
            return;
        }

        // Get the full list of items
        let allItems = [...this.options.elList.querySelectorAll(this.options.selItem)];
        let originalIndex = allItems.indexOf(item);
        let currentIndex = -1;
        if (originalIndex < 0)
        {
            console.error("item to be dragged isn't in list of all items");
            return;
        }

        // Get the bounding rectangles of all items 
        let scrollY = window.scrollY;
        allItems = allItems.map(x => {
            var r = x.getBoundingClientRect();
            return {
                item: x,
                top: r.top + scrollY,
                bottom: r.bottom + scrollY,
            }
        });

        // Stop event, we'll handle this thanks.
        ev.preventDefault();
        ev.stopPropagation();

        let self = this;

        // Setup event handlers
        this.options.elList.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        let originalY = ev.pageY;
        item.classList.add("dragging");
        this.options.elList.classList.add("drag-active");

        setCurrentIndex(originalIndex);

        function onPointerMove(ev)
        {
            // Update item transform
            let delta = ev.pageY-originalY;
            item.style.transform = `translateY(${delta}px)`;

            // Work out Y-coord of item
            let newYCoord = allItems[originalIndex].top + delta;

            // Work out new insert position
            setCurrentIndex(findIndex(newYCoord));
        }
        function onPointerUp(ev)
        {
            finish();
        }

        function finish()
        {
            if (currentIndex >= 0 && currentIndex + 1 < allItems.length)
            {
                allItems[currentIndex + 1].item.classList.remove("after-gap");
            }
            for (let i=0; i<allItems.length; i++)
            {
                allItems[i].item.style.transform = ``;
            }
            item.classList.remove("dragging");
            self.options.elList.classList.remove("drag-active");
            self.options.elList.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);

            if (currentIndex != originalIndex)
                self.options.moveItem(originalIndex, currentIndex);
        }

        function setCurrentIndex(index)
        {
            // Quit if not changed
            if (currentIndex == index)
                return;

            if (currentIndex >= 0 && currentIndex + 1 < allItems.length)
            {
                allItems[currentIndex + 1].item.classList.remove("after-gap");
            }
            if (index >= 0 && index + 1 < allItems.length)
            {
                allItems[index + 1].item.classList.add("after-gap");
            }

            let height = allItems[originalIndex].bottom - allItems[originalIndex].top;
            // Update transform on all items
            for (let i=0; i<allItems.length; i++)
            {
                if (i == originalIndex)
                    continue;

                let transform = 0;
                if (i < originalIndex && i >= index)
                {
                    transform = height;
                }
                else if (i > originalIndex && i <= index)
                {
                    transform = -height;
                }
                if (transform == 0)
                    allItems[i].item.style.transform = ``;
                else
                    allItems[i].item.style.transform = `translateY(${transform}px)`;
            }

            currentIndex = index;
        }

        function findIndex(y)
        {
            for (let i=0; i<allItems.length; i++)
            {
                let item = allItems[i];
                if (y < (item.top + item.bottom) / 2)
                    return i;
            }
            return allItems.length;
        }
    }

}