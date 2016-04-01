'use strict';
/**
 * Builds Parameters object from dynamic arguments
 */
module.exports = class ParamsBuilder {
    /**
     * Setters
     */
    constructor(ctx) { this.ctx = ctx; }
    /**
     * Parse params according ctx type
     */
    build() {
        if (this.ctx.type === "model")
            return { range: this.ctx.arguments[0], custom: this.ctx.arguments[1], where: this.ctx.arguments[2], next: this.ctx.arguments[3] };
        if (this.ctx.type === "relation" && this.ctx.relation)
            return { id: this.ctx.arguments[0], range: this.ctx.arguments[1], custom: this.ctx.arguments[2], where: this.ctx.arguments[3], next: this.ctx.arguments[4] };
        if (this.ctx.type === "relation" && !this.ctx.relation)
            return { id: this.ctx.arguments[0], relation: this.ctx.arguments[1], range: this.ctx.arguments[2], custom: this.ctx.arguments[3], where: this.ctx.arguments[4], next: this.ctx.arguments[5] };
        if (this.ctx.type === "nested")
            return { id: this.ctx.arguments[0], nested: this.ctx.arguments[1], range: this.ctx.arguments[2], custom: this.ctx.arguments[3], where: this.ctx.arguments[4], next: this.ctx.arguments[5] };
    }
}