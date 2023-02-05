// todo add unit test for all functions

// --------------- Set

Object.defineProperty(Set.prototype, "hasAny", {
    value: function(...values) {
      for (var value of values) {
        if (this.has(value)) {
          return true;
        }
      }
      return false;
    }
});

Object.defineProperty(Set.prototype, "hasNot", {
    value: function(value) {
      return !this.has(value);
    }
});


// --------------- Array

Object.defineProperty(Array.prototype, "toMap", {
    value: function() {
      return new Map(this);
    }
});

Object.defineProperty(Array.prototype, "toSet", {
    value: function() {
      return new Set(this === undefined ? [] : this);
    }
});

Object.defineProperty(Array.prototype, "orEmpty", {
    value: function() {
      return this === undefined ? [] : this;
    }
});

Object.defineProperty(Array.prototype, "isNullOrEmpty", {
    value: function() {
      return this === undefined || this.length == 0;
    }
});

Object.defineProperty(Array.prototype, "isNotEmpty", {
    value: function() {
      return !this.isNullOrEmpty();
    }
});