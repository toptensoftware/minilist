
// Parse an item in text format
function parseLine(str)
{
    let checked;

    let m = str.match(/^(✗|\*|\-|•|\[ \])\s(.*)/);
    if (m)
    {
        checked = false;
        str = m[2];
    }
    else
    {
        m = str.match(/^(✓|\[\*\]|\[x\]|\[✓\]|\[X\])\s(.*)/);
        if (m)
        {
            checked = true;
            str = m[2];
        }
    }

    m = str.match(/^(\d+)x\s(.*)/);
    let count;
    if (m)
    {
        count = parseInt(m[1]);
        str = m[2];
    }

    return { 
        checked,
        count,
        text: str.trim()
    }

}

// Parse all lines in text format and return a collection of items
export function parseText(text)
{
    // Parse all lines
    let lines = text.replace(/\r\n|\n\r|\r/g, "\n").split("\n").map(x => parseLine(x)).filter(x => x.text != "");

    // If there are any lines that are definitely checked or not checked
    let hasGroups = lines.some(x => x.checked !== undefined);

    if (hasGroups)
    {
        return lines.map(x => ({
            name: x.text,
            count: x.checked == undefined ? 0 : (x.count ?? 1),
            checked: x.checked ?? false,
            separator: x.checked === undefined,
        }));
    }
    else
    {
        return lines.map(x => ({
            name: x.text,
            count: x.count ?? 1,
            checked: false,
            separator: false,
        }));
    }
}

// Format a set of items into reparsable text format
export function formatText(items)
{
    let str = "";
    for (let i=0; i<items.length; i++)
    {
        let item = items[i];
        if (item.separator)
        {
            if (i > 0)
                str += '\n';
            str += `${item.name}\n`;
        }
        else if (item.count == 1)
        {
            str += `${item.checked ? '✓' : '•'} ${item.name}\n`;
        }
        else
        {
            str += `${item.checked ? '✓' : '•'} ${item.count}x ${item.name}\n`;
        }
    }
    return str;
}
