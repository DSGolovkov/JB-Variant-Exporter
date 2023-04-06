figma.showUI(__html__, {visible: false});

//*** Export Selected *** — need refactoring!

function checkVariants(varCom) {
    let varComChecked = [];
    if (varCom) {
        for (let i = 0; i < varCom.length; i++) {
            let innerObjects = varCom[i].findChildren(n => n.type === "COMPONENT");
            if (innerObjects.length == 2) {
                if (innerObjects[0].name.replaceAll(" ", "") == "Theme=Light" && innerObjects[1].name.replaceAll(" ", "") == "Theme=Dark") {
                    varComChecked.push(varCom[i]);
                } else if (innerObjects[1].name.replaceAll(" ", "") == "Theme=Light" && innerObjects[0].name.replaceAll(" ", "") == "Theme=Dark") {
                    varComChecked.push(varCom[i]);
                }
            }
        }
    }
    return varComChecked;
}

function exportVariant() {
    let varCom;
    let zipConfirm = false;
    if (figma.currentPage.selection.length > 0) {
        varCom = figma.currentPage.selection.filter(n => n.type === 'COMPONENT_SET');
        if (checkVariants(varCom).length > 0) {
            varCom = checkVariants(varCom);
            for (let i = 0; i < varCom.length; i++) {
                let varIcon = varCom[i].findChildren(n => n.type === "COMPONENT");
                let repName = varCom[i].name.replace(/\s+/g, '');
                let counter = varCom[i].name.split('/').length - 1;
                let varComName = varCom[i].name.split('/')[counter].trim();
                let zipDir = repName.slice(0, -varComName.length - 1);
                for (let j = 0; j < varIcon.length; j++) {
                    let varIconName = varIcon[j].name;
                    varIcon[j].exportAsync({format: 'SVG'}).then(file => {
                        if (i === (varCom.length - 1) && j === (varIcon.length - 1)) {
                            zipConfirm = true;
                        }
                        figma.ui.postMessage({type: 'export', file, varIconName, varComName, zipDir, zipConfirm});
                    });
                }
            }
        } else {
            figma.notify("Nothing to export...");
            figma.closePlugin();
        }
    } else {
        figma.closePlugin();
        figma.notify("Nothing to export...");
    }
}

//*** Combine as Variants ***

let componentNodes = [];

function combineAsVariant() {
    findComponents()
    createVariants(getPairs());
}

function findComponents() {
    componentNodes = figma.currentPage.selection.filter(n => n.type === "COMPONENT");
    let frameNodes = figma.currentPage.selection.filter(n => n.type === "FRAME");
    findInnerComponents(frameNodes);
}

function findInnerComponents(frameNodes) {
    for (let i = 0; i < frameNodes.length; i++) {
        let newComponentNodes = frameNodes[i].findChildren(n => n.type === "COMPONENT");
        let newFrameNodes = frameNodes[i].findChildren(n => n.type === "FRAME");
        componentNodes = componentNodes.concat(newComponentNodes);
        if (newFrameNodes) {
            findInnerComponents(newFrameNodes);
        }
    }
}

function getPairs() {
    let componentPairs = [];
    for (let i = 0; i < componentNodes.length; i++) {
        if (componentNodes[i].name.toLowerCase().includes("_dark")) {
            for (let j = 0; j < componentNodes.length; j++) {
                if (componentNodes[j].name == componentNodes[i].name.replace("_dark", "")) {
                    componentPairs.push([componentNodes[j], componentNodes[i]]);
                    break;
                }
            }
        }
    }
    return componentPairs;
}

function createVariants(componentPairs) {
    for (let i = 0; i < componentPairs.length; i++) {
        let newVariant = figma.combineAsVariants(componentPairs[i], componentPairs[i][0].parent);
        setProperties(newVariant);
        drawVariant(newVariant);
    }
    sendNotification(componentPairs.length);
}

function setProperties(newVariant) {
    let newChildren = newVariant.findChildren(n => n.type === "COMPONENT");
    newVariant.name = newChildren[0].name.split("=")[1].trim();
    newVariant.cornerRadius = 0;
    newVariant.strokeWeight = 0;
    newVariant.resizeWithoutConstraints(88, 44);
    newChildren[0].name = "Theme=Light";
    newChildren[1].name = "Theme=Dark";
    switch (newChildren[0].width) {
        case 12:
            newChildren[0].x = 16;
            newChildren[0].y = 16
            newChildren[1].x = 60;
            newChildren[1].y = 16;
            newVariant.y -= 8;
            newVariant.x -= 4;
            break;
        case 16:
            newChildren[0].x = 14;
            newChildren[0].y = 14
            newChildren[1].x = 58;
            newChildren[1].y = 14;
            newVariant.x -= 2;
            newVariant.y -= 6;
            break;
        case 20:
            newChildren[0].x = 12;
            newChildren[0].y = 12
            newChildren[1].x = 56;
            newChildren[1].y = 12;
            newVariant.y -= 4;
            break;
    }
}

function drawVariant(newVariant) {
    newVariant.cornerRadius = 0;
    newVariant.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientStops:[
            {color: {r: 1, g: 1, b: 1, a: 1}, position: 0},
            {color: {r: 1, g: 1, b: 1, a: 1}, position: 0.5},
            {color: {r: 0.11764705926179886, g: 0.12287582457065582, b: 0.13333334028720856, a: 1}, position: 0.5},
            {color: {r: 0.11764705926179886, g: 0.12287582457065582, b: 0.13333334028720856, a: 1}, position: 1},
        ],
        gradientTransform: {0: {0: 1, 1: -1.8566250759022296e-8, 2: 9.35088539932849e-9}, 1: {0: 2.982353919378511e-8, 1: 1.0073529481887817, 2: -0.007352969143539667}}
    }];
}

function sendNotification(numberOfVariants) {
    switch (numberOfVariants) {
        case 0:
            figma.closePlugin("Nothing to combine")
            break;
        case 1:
            figma.closePlugin(`Variant created`);
            break;
        default:
            figma.closePlugin(`${numberOfVariants} variants created`);
    }
}

//*** Generate Names ***

function generateNames() {
    let componentSetNodes = figma.currentPage.selection.filter(n => n.type === "COMPONENT_SET");
    if (componentSetNodes) {
        for (let i = 0; i < componentSetNodes.length; i++) {
        }
        figma.closePlugin("Sorry! Dima is trying to understand how it works...");
    }
}

//*** Figma Commands ***

switch (figma.command) {
    case 'export':
        exportVariant();
        break;
    case 'combine':
        combineAsVariant();
        break;
    case "generateNames":
        generateNames()
        break;
}

figma.ui.onmessage = msg => {
    if (msg.type === 'stop') {
        figma.closePlugin();
    }
}






