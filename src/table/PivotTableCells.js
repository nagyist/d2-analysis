import { ResponseRowIdCombination } from '../api/ResponseRowIdCombination';
import { getRoundedHtmlValue } from './PivotTableUtils';
import uuid from 'd2-utilizr/lib/uuid';

/** @description factory function for cell with default options.
 *  @returns {object}
 */
const DefaultCell = () => {
    return {
        htmlValue: '&nbsp;',

        collapsed: false,
        hidden:    false,
        empty:     false,
        
        colSpan:   1,
        rowSpan:   1,
        
        width:     120,
        height:    25,
    };
};

/** @description
 *  @param   {number} value 
 *  @param   {object} response 
 *  @param   {object} rric 
 *  @param   {array} uuids 
 *  @returns {object}
 */
export const ValueCell = (value, response, rric, uuids) => {
    const cell  = DefaultCell();
    
    cell.uuid       = uuid();
    cell.uuids      = uuids;

    cell.empty      = value === -1;
    cell.value      = value === -1 ? 0        : value;
    cell.htmlValue  = value === -1 ? '&nbsp;' : value;

    cell.isValue    = !cell.empty;

    cell.type       = 'value';
    cell.cls        = 'pivot-value' + (cell.empty ? ' cursor-default' : ' pointer');

    cell.dxId       = rric.getIdByIds(response.metaData.dimensions.dx);
    cell.peId       = rric.getIdByIds(response.metaData.dimensions.pe);
    cell.ouId       = rric.getIdByIds(response.metaData.dimensions.ou);

    return cell;
};

export const PlainValueCell = (value) => {
    const cell = DefaultCell();

    cell.value      = value;
    cell.type       = 'value';
    cell.htmlValue  = value === 0 ? '&nbsp;' : value;

    return cell;
}

/** @description factory function for value sub total cells.
 *  @param   {number} value 
 *  @returns {object}
 */
export const ValueSubTotalCell = (value) => {
    const cell = DefaultCell();

    cell.value     = value;
    cell.type      = 'valueSubtotal';
    cell.cls       = 'pivot-value-subtotal';

    cell.empty     = value <= 0;
    
    cell.htmlValue = cell.empty ? '&nbsp;' : getRoundedHtmlValue(value);

    return cell;
};

/** @description factory function for value grand total cells.
 *  @param   {number} value 
 *  @returns {object}
 */
export const ValueTotalCell = (value) => {
    const cell = DefaultCell();

    cell.value     = value;
    cell.type      = 'valueTotal';
    cell.cls       = 'pivot-value-total-subgrandtotal';

    cell.empty     = value <= 0;

    cell.htmlValue = cell.empty ? '&nbsp;' : getRoundedHtmlValue(value);

    return cell;
};

/** @description factory functon for column axis cells.
 *  @param   {any} parentCell 
 *  @param   {any} response 
 *  @param   {any} showHierarchy 
 *  @param   {any} hidden 
 *  @returns {object}
 */
export const RowAxisCell = (axisObject, response, showHierarchy, hidden) => {
    const cell = axisObject;

    cell.collapsed = false;
    cell.hidden    = false;
    cell.empty     = false;
    cell.width     = 120;
    cell.height    = 25;

    cell.type      = 'dimension';
    cell.axis      = 'row';
    cell.cls       = 'pivot-dim pivot-row-dim td-nobreak'

    if (showHierarchy) {
        cell.csl += ' align-left';
    } 

    cell.noBreak   = true;
    cell.hidden    = hidden;

    cell.htmlValue = response.getItemName(cell.id, showHierarchy, true);

    return cell;
};

/** @description factory function for row axis cells.
 *  @param   {object} parentCell 
 *  @param   {object} resoonse
 *  @param   {boolean} showHierarchy
 *  @param   {boolean} hidden 
 *  @param   {string} sort
 *  @returns {object}
 */
export const ColumnAxisCell = (axisObject, response, showHierarchy, hidden, sort) => {
    const cell = axisObject;

    cell.collapsed = false;
    cell.hidden    = false;
    cell.empty     = false;
    cell.width     = 120;
    cell.height    = 25;

    cell.type      = 'dimension';
    cell.axis      = 'column';
    cell.cls       = 'pivot-dim pivot-col-dim';

    cell.noBreak   = false;
    cell.hidden    = hidden;

    if (sort) {
        cell.sort  = sort;
        cell.cls += ' td-sortable';
    }
    
    cell.htmlValue = response.getItemName(cell.id, showHierarchy, true);

    return cell;
};

/** @description factory function for dimension sub total cells.
 *  @param   {string} value 
 *  @param   {number} colSpan 
 *  @param   {number} rowSpan 
 *  @param   {boolean} empty 
 *  @param   {boolean} hidden 
 *  @returns {object}
 */
export const DimensionSubTotalCell = (value, colSpan, rowSpan, empty, hidden) => {
    const cell = DefaultCell();

    cell.value     = value;
    cell.type      = 'dimensionSubtotal';
    cell.cls       = 'pivot-dim-subtotal';

    cell.colSpan   = colSpan;
    cell.rowSpan   = rowSpan;

    cell.empty     = empty;
    cell.hidden    = hidden;

    return cell;
};

/** @description factory function for dimension grand total cells.
 *  @param {string}  value 
 *  @param {number}  colSpan 
 *  @param {number}  rowSpan 
 *  @param {boolean} sort 
 *  @param {boolean} generateUuid 
 *  @returns 
 */
export const DimensionGrandTotalCell = (value, colSpan, rowSpan, sort, generateUuid) => {
    const cell = DefaultCell();

    cell.value   = value;
    cell.type    = 'dimensionTotal';
    cell.cls     = 'pivot-dim-total';

    cell.colSpan = colSpan;
    cell.rowSpan = rowSpan;

    cell.sort    = sort ? 'total' : null;
    cell.uuid    = generateUuid ? uuid() : null;

    cell.htmlValue = value;

    return cell;
};

/** @description factory function for dimension empty cells.
 *  @param   {number} colSpan 
 *  @param   {number} rowSpan 
 *  @param   {number} hidden 
 *  @returns {object}
 */
export const DimensionEmptyCell = (colSpan, rowSpan, hidden) => {
    const cell = DefaultCell();

    cell.value     = '&nbsp;';
    cell.type      = 'empty';
    cell.cls       = 'pivot-empty';

    cell.colSpan   = colSpan;
    cell.rowSpan   = rowSpan;

    cell.width     = colSpan * 120;
    cell.height    = rowSpan * 25;

    cell.hidden    = hidden;

    return cell;
};

/** @description factory function for labeled dimension cell.
 *  @param   {string} value 
 *  @returns {object} 
 */
export const DimensionLabelCell = (value, dim) => {
    const cell = DefaultCell();

    cell.value = value;
    cell.type  = 'labeled';
    cell.cls   = 'pivot-dim-label';

    cell.dim = dim;
    cell.axis = 'row';

    cell.htmlValue = value;

    return cell;
};

/** @description factory function for padding cells.
 *   @param   {number}  width 
 *   @param   {number}  height 
 *   @param   {number}  colSpan 
 *   @param   {number}  rowSpan 
 *   @param   {boolean} hidden 
 *   @returns {object}
 */
export const PaddingCell = (width=0, height=0, colSpan, rowSpan, hidden) => {
    const cell = DefaultCell();

    cell.value     = '&nbsp;';
    cell.type      = 'padding';
    cell.cls       = 'pivot-padding';

    cell.width     = width;
    cell.height    = height;

    cell.colSpan   = colSpan;
    cell.rowSpan   = rowSpan;

    cell.hidden    = hidden;

    return cell;
};

 /** @description factor function for horizontal padding cells.
 *   @param   {number} width 
 *   @param   {boolean} hidden 
 *   @returns {object}
 */
export const HorizontalPaddingCell = (width=0, cls='', hidden) => {
    const cell = DefaultCell();
    
    if (typeof hidden === 'undefined') {
        hidden = width <= 0;
    }

    cell.value     = '&nbsp;';
    cell.type      = 'padding';
    cell.cls       = 'pivot-padding ';

    cell.cls       += cls;

    cell.width     = width;

    cell.hidden    = hidden;

    return cell;
};

 /** @description factory function for vertical padding cells.
 *   @param   {number} height 
 *   @param   {boolean} hidden 
 *   @returns {object}
 */
export const VerticalPaddingCell = (height=0, cls='', hidden) => {
    const cell = DefaultCell();
    
    if (typeof hidden === 'undefined') {
        hidden = height <= 0;
    }

    cell.value     = '&nbsp;';
    cell.type      = 'padding';
    cell.cls       = 'pivot-padding ';

    cell.cls       += cls;

    cell.height    = height;

    cell.hidden    = hidden;

    return cell;
};

 /** @description factory function for filter cells.
 *   @param   {string} text 
 *   @param   {number} colSpan 
 *   @returns {object}
 */
export const FilterCell = (text, colSpan) => {
    const cell = DefaultCell();

    cell.cls       = 'pivot-filter cursor-default',
    cell.type      = 'filter',
    
    cell.colSpan   = colSpan,
    cell.title     = text,
    cell.htmlValue = text

    return cell;
};