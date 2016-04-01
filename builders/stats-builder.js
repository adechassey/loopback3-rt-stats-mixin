'use strict';
/**
 * Stats Builder Dependencies
 */
var moment = require('moment');
var TypeBuilder = require('./type-builder');
/**
 * Builds Statistic Array from List of Resuls
 */
module.exports = class StatsBuilder {

    constructor(ctx) { this.ctx = ctx; }

    process(list) {
        this.list = list;
        let dataset = [];
        let iterator = this.getIteratorCount();
        for (let i = 0, dateIndex = iterator; i <= iterator; i++ , dateIndex--) {
            let current = this.getCurrentMoment(dateIndex);
            let count = this.getCurrentCount(current);
            dataset.push({
                date: current.toISOString(),
                count: count === 0 ? 0 : this.ctx.count.avg ? (count / list.length) : count
            });
        }
        return dataset;
    }

    getCurrentCount(current) {
        let count = 0;
        this.list.forEach(item => {
            let itemDate = moment(item[this.ctx.count.on]);
            let itemFactor = this.getFactor(item);
            switch (this.ctx.params.range) {
                case 'weekly':
                case 'monthly':
                    if (current.isSame(itemDate, 'day')) count = count + itemFactor;
                    break;
                case 'annual':
                    if (current.isSame(itemDate, 'month')) count = count + itemFactor;
                    break;
                case 'daily':
                default:
                    if (current.isSame(itemDate, 'hour')) count = count + itemFactor;
                    break;
            }
        });
        return count;
    }

    getFactor(item) {
        let value;
        // When count by index, the factor will always be 1
        if (this.ctx.count.by === 'index')  {
            value = 1;
        } else {
            // We get the value from the property, can be number or boolean
            // When number we set that value as factor, else we evaluate
            // the value depending on true/false value and this.ctx.count.as value
            if (this.ctx.count.by.match(/\./)) {
                value = this.ctx.count.by.split('.').reduce((a, b) => a[b] ? a[b] : 0, item);
            } else {
                value = item[this.ctx.count.by];
            }
            // When value is boolean we set 0, 1 or this.ctx.count.as to set a value when true
            if (typeof value === 'boolean' && value === true) {
                value = this.ctx.count.as ? this.ctx.count.as : 1;
            } else if (typeof value === 'boolean' && value === false) {
                value = 0;
            }
        }
        // Make sure we send back a number
        return typeof value === 'number' ? value : parseInt(value);
    }

    getCurrentMoment(index) {
        let current;
        switch (this.ctx.params.range) {
            case 'weekly':
                current = moment(this.ctx.nowISOString).subtract(index, 'days');
                break;
            case 'monthly':
                current = moment(this.ctx.nowISOString).subtract(index, 'days');
                break;
            case 'annual':
                current = moment(this.ctx.nowISOString).subtract(index, 'months');
                break;
            case 'daily':
            default:
                current = moment(this.ctx.nowISOString).subtract(index, 'hours');
                break;
        }
        return current;
    }

    getIteratorCount() {
        let iterator;
        switch (this.ctx.params.range) {
            case 'daily':
                iterator = 24;
                break;
            case 'weekly':
                iterator = 7;
                break;
            case 'monthly':
                iterator = this.ctx.now.daysInMonth();
                break;
            case 'annual':
                iterator = 12;
                break;
            case 'custom':
                let start = moment(this.ctx.params.custom.start);
                let end = moment(this.ctx.params.custom.end);
                iterator = 0;
                ['hour', 'day', 'week', 'month','year'].forEach(item => {
                    let plural = [item, 's'].join('');
                    let diff   = end.diff(start, plural);
                    if (diff > 1 && diff < 25) {
                        iterator = item === 'week' ? end.diff(start, 'days') : diff;
                        this.ctx.params.range = new TypeBuilder(this.ctx).build();
                    }
                });
            break;
        }
        return iterator;
    }
}
