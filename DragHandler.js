export class DragHandler
{
    // options.elList - the element containing all the items
    // options.selItem - selector for selecting items in the list
    // options.selHandle - selector to match pointer clicks to handle
    // options.getScrollBounds - callback to provide a { top: y, bottom: y } in client coords or the visible scroll region
    // options.onMoveItem(from, to) - callback to move an item
    constructor(options)
    {
        this.options = options;
        this.options.elList.addEventListener("pointerdown", this.onPointerDown.bind(this));
    }

    // Pointer down handler
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

        // Get the parent scroller
        let scroller = getScrollParent(this.options.elList) ?? this.options.elList;
        let scrollerTop = scroller.scrollTop;

        // Get the bounding rectangles of all items in page coords
        allItems = allItems.map(x => {
            var r = x.getBoundingClientRect();
            return {
                item: x,
                top: r.top + scrollerTop,
                bottom: r.bottom + scrollerTop,
            }
        });

        // Get the bounding rectangle of the list itself
        let listBounds = this.options.getScrollBounds();

        // Get it's original bounds
        let itemBounds = item.getBoundingClientRect();

        // Create the gap placeholder
        let placeHolder = document.createElement("div");
        placeHolder.style.height = `${itemBounds.bottom - itemBounds.top}px`;
        item.after(placeHolder);

        // Switch the item being dragged to fixed positioning
        item.style.position = "fixed";
        item.style.left = "0px";
        item.style.right = "0px";
        item.style.top = `${itemBounds.top}px`;

        // Stores the item that currently has the "after-gap" class set
        let elFirstAfterGap = null;

        // Stop event, we'll handle this thanks.
        ev.preventDefault();
        ev.stopPropagation();

        // Who am I?
        let self = this;

        // Setup event handlers
        this.options.elList.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);

        // Add classes
        item.classList.add("dragging");
        this.options.elList.classList.add("drag-active");

        // Capture original click position
        let originalY = ev.clientY;
        let moveY = ev.clientY;
        let lastYCoord;
        setCurrentIndex(originalIndex);

        function onPointerMove(ev)
        {
            // Update item transform
            let delta = ev.clientY - originalY;
            moveY = ev.screenY;
            item.style.transform = `translateY(${delta}px)`;

            // Work out Y-coord of item
            let newYCoord = itemBounds.top + delta;
            let newYCoordBottom = itemBounds.bottom + delta;

            // Remember position at last mouse move
            lastYCoord = newYCoord;

            // Work out new insert position
            setCurrentIndex(findIndex(lastYCoord + scroller.scrollTop));

            // Start/stop auto scrolling
            if (newYCoord < listBounds.top + 20)
            {
                setAutoScroll(newYCoord - (listBounds.top + 20));
            }
            else if (newYCoordBottom > listBounds.bottom - 20)
            {
                setAutoScroll(newYCoordBottom - (listBounds.bottom - 20));
            }
            else
            {
                setAutoScroll(0);
            }

            ev.preventDefault();
        }

        // Start/stop auto scrolling by specified speed
        let autoScrollSpeed = 0;
        function setAutoScroll(speed)
        {
            autoScrollSpeed = speed;
            if (autoScrollSpeed != 0)
            {
                requestAnimationFrame(() => {
                    scrollByPrecise(autoScrollSpeed / 120);
                    setCurrentIndex(findIndex(lastYCoord + scroller.scrollTop));
                    setAutoScroll(autoScrollSpeed);
                });
            }
        }

        // More precise version of scrollBy() that accumulates
        // fractional scroll positions
        let pendingScrollDelta = 0;
        function scrollByPrecise(delta)
        {
            // If switched to opposite direction, don't use the pending scroll delta
            if ((delta < 0) == (pendingScrollDelta < 0))
                delta += pendingScrollDelta;

            scroller.scrollBy(0, parseInt(delta));
            pendingScrollDelta = delta % 1;
        }

        // Pointer release handler, clean up everything and fire event
        function onPointerUp(ev)
        {
            // Remove the after-gap class
            if (elFirstAfterGap != null)
                elFirstAfterGap.classList.remove("after-gap");

            // Remove all transforms
            for (let i=0; i<allItems.length; i++)
            {
                allItems[i].item.style.transform = ``;
            }

            // Remove the place  holder
            placeHolder.remove();

            // Remove the dragging classes
            item.classList.remove("dragging");
            self.options.elList.classList.remove("drag-active");

            // Remove absolute positioning
            item.style.removeProperty("position");
            item.style.removeProperty("left");
            item.style.removeProperty("right");
            item.style.removeProperty("top");

            // Remove event handlers
            self.options.elList.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);

            // Stop auto scrolling
            setAutoScroll(0);

            // Move the item
            if (currentIndex != originalIndex)
                self.options.moveItem(originalIndex, currentIndex);

            ev.preventDefault();
            ev.stopPropagation();
        }

        // Set the current insert position
        function setCurrentIndex(index)
        {
            // Quit if not changed
            if (currentIndex == index)
                return;

            if (elFirstAfterGap)
            {
                elFirstAfterGap.classList.remove("after-gap");
                elFirstAfterGap = null;
            }

            // Update transform on all items
            let height = itemBounds.bottom - itemBounds.top;
            for (let i=0; i<allItems.length; i++)
            {
                if (i == originalIndex)
                    continue;

                // Set the 'after-gap' class on the first item after the gap
                if (i > index && elFirstAfterGap == null)
                {
                    elFirstAfterGap = allItems[i].item;
                    elFirstAfterGap.classList.add("after-gap");
                }

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

        // Given a y-coord in screen units, find the item to insert before
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


function getScrollParent(node) 
{
    if (node == null)
        return null;

    if (node.scrollHeight > node.clientHeight)
        return node;

    return getScrollParent(node.parentNode);
}