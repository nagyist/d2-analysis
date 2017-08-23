import isArray from 'd2-utilizr/lib/isArray';
import arrayContains from 'd2-utilizr/lib/arrayContains';
import arrayPluck from 'd2-utilizr/lib/arrayPluck';
import arraySort from 'd2-utilizr/lib/arraySort';
import arrayUnique from 'd2-utilizr/lib/arrayUnique';
import arrayRepeat from 'd2-utilizr/lib/arrayRepeat';
import uuid from 'd2-utilizr/lib/uuid';

export const PivotTableAxis = function(refs, layout, response, type) {

    const ignoreKeys = [
        'dy', 'longitude', 'latitude'
    ];
    
    let aaUniqueFloorIds,
        spanType,
        aDimensions = [],
        nAxisWidth = 1,
        nAxisHeight,
        aUniqueFloorWidth = [],
        aAccFloorWidth = [],
        aFloorSpan = [],
        aaGuiFloorIds = [],
        aaAllFloorIds = [],
        aCondoId = [],
        aaAllFloorObjects = [],
        uuidObjectMap = {};

    if (type === 'col') {
        aDimensions = (layout.columns || []).filter(dim => !arrayContains(ignoreKeys, dim.dimension));
        spanType = 'colSpan';
    }
    else if (type === 'row') {
        aDimensions = (layout.rows || []).filter(dim => !arrayContains(ignoreKeys, dim.dimension));
        spanType = 'rowSpan';
    }

    if (!(isArray(aDimensions) && aDimensions.length)) {
        return;
    }

    // aaUniqueFloorIds: array of arrays with unique ids for each dimension floor
    aaUniqueFloorIds = function() {
        let dimensionNameIdsMap = layout.getDimensionNameIdsMap(response),
            dims;
            
        return aDimensions.map((dimension, index) => {
            if (dimension.sorted) dims = arrayPluck(dimension.items, 'id');
            else                  dims = dimensionNameIdsMap[dimension.dimension];

            nAxisWidth *= dims.length;
            aUniqueFloorWidth.push(dims.length);
            aAccFloorWidth.push(nAxisWidth);
            aFloorSpan.unshift(nAxisWidth / aAccFloorWidth[Math.max(0, index - 1)]);

            return dims;
        });
    }();

    // nAxisHeight
    nAxisHeight = aaUniqueFloorIds.length;

    aaGuiFloorIds = aaUniqueFloorIds.map((ids, index) => {
        if (index == 0) return ids;
        else            return arrayRepeat(ids, aAccFloorWidth[index - 1]);
    });

    aaAllFloorIds = aaGuiFloorIds.map((id, index) => {
        return arrayRepeat(id, aFloorSpan[index], true);
    });

    aaAllFloorObjects = aaAllFloorIds.map((ids, i) => {
        return ids.map((id, j) => {
            return {
                id: aaAllFloorIds[i][j],
                uuid: uuid(),
                dim: i,
                leaf: i === aaAllFloorIds.length - 1,
                axis: type,
                isOrganisationUnit: response.hasIdByDimensionName(aaAllFloorIds[i][j], 'ou'),
            };
        });
    });

    // aCondoId
    for (let i = 0, ids; i < nAxisWidth; i++) {
        ids = aaAllFloorIds.map((id) => id[i]);

        if (ids.length) {
            aCondoId.push(ids.join('-'));
        }
    }

    // add span and children
    for (var i = 0, aAboveFloorObjects, doorIds, uniqueDoorIds; i < aaAllFloorObjects.length; i++) {
        doorIds = [];

        for (var j = 0, obj, doorCount = 0, siblingPosition = 0, oldestObj; j < aaAllFloorObjects[i].length; j++) {

            obj = aaAllFloorObjects[i][j];
            doorIds.push(obj.id);

            if (doorCount === 0) {

                // span
                obj[spanType] = aFloorSpan[i];

                // children
                if (obj.leaf) {
                    obj.children = 0;
                }

                // first sibling
                obj.oldest = true;

                // root?
                if (i === 0) {
                    obj.root = true;
                }

                // tmp oldest uuid
                oldestObj = obj;
            }

            obj.oldestSibling = oldestObj;
            obj.siblingPosition = siblingPosition++;

            if (aaAllFloorObjects[i][j + 1] && obj.id !== aaAllFloorObjects[i][j + 1].id) {
                siblingPosition = 0;
            }

            if (++doorCount === aFloorSpan[i]) {
                doorCount = 0;
            }
        }

        // set above floor door children to number of unique door ids on this floor
        if (i > 0) {
            aAboveFloorObjects = aaAllFloorObjects[i-1];
            uniqueDoorIds = arrayUnique(doorIds);

            for (var j = 0; j < aAboveFloorObjects.length; j++) {
                aAboveFloorObjects[j].children = uniqueDoorIds.length;
            }
        }
    }

    console.log(6)
    // add parents if more than 1 floor
    if (nAxisHeight > 1) {
        for (var i = 1, aAllFloor; i < nAxisHeight; i++) {
            aAllFloor = aaAllFloorObjects[i];

            //for (var j = 0, obj, doorCount = 0, span = aFloorSpan[i - 1], parentObj = aaAllFloorObjects[i - 1][0]; j < aAllFloor.length; j++) {
            for (var j = 0, doorCount = 0, span = aFloorSpan[i - 1]; j < aAllFloor.length; j++) {
                aAllFloor[j].parent = aaAllFloorObjects[i - 1][j];

                //doorCount++;

                //if (doorCount === span) {
                    //parentObj = aaAllFloorObjects[i - 1][j + 1];
                    //doorCount = 0;
                //}
            }
        }
    }

    // add uuids array to leaves
    if (aaAllFloorObjects.length) {

        // set span to second lowest span number: if aFloorSpan == [15,3,15,1], set span to 3
        var nSpan = nAxisHeight > 1 ? arraySort(aFloorSpan.slice())[1] : nAxisWidth,
            aAllFloorObjectsLast = aaAllFloorObjects[aaAllFloorObjects.length - 1];

        for (var i = 0, leaf, parentUuids, obj, leafUuids = []; i < aAllFloorObjectsLast.length; i++) {
            leaf = aAllFloorObjectsLast[i];
            leafUuids.push(leaf.uuid);
            parentUuids = [];
            obj = leaf;

            // get the uuid of the oldest sibling
            while (obj.parent) {
                obj = obj.parent;
                if(!obj.root && obj.oldestSibling) {
                    parentUuids.push(obj.oldestSibling.uuid);
                } else {
                    parentUuids.push(obj.uuid);
                }
            }

            // add parent uuids to leaf
            leaf.uuids = parentUuids.slice();

            // add uuid for all leaves
            if (leafUuids.length === nSpan) {
                for (var j = (i - nSpan) + 1, leaf; j <= i; j++) {
                    leaf = aAllFloorObjectsLast[j];
                    leaf.uuids = leaf.uuids.concat(leafUuids);
                }

                leafUuids = [];
            }
        }
    }

    // populate uuidObject map
    for (var i = 0; i < aaAllFloorObjects.length; i++) {
        for (var j = 0, object; j < aaAllFloorObjects[i].length; j++) {
            object = aaAllFloorObjects[i][j];

            uuidObjectMap[object.uuid] = object;
        }
    }


    console.log(7)

    return {
        type: type,
        items: aDimensions,
        xItems: {
            unique: aaUniqueFloorIds,
            gui: aaGuiFloorIds,
            all: aaAllFloorIds
        },
        objects: {
            all: aaAllFloorObjects
        },
        ids: aCondoId,
        span: aFloorSpan,
        dims: nAxisHeight,
        size: nAxisWidth,
        uuidObjectMap: uuidObjectMap
    };
};
