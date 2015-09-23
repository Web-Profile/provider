(function(){

  var regexp = /{layer}/g;

  function setBackground(node){
    var html = '',
        items = node.items || 5,
        width = 100 / items;
    while (items--) html += '<img class="x-rating-item x-rating-{layer}-item" style="width: ' + width + '%" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />';
    node.xtag.fullInner.innerHTML = html.replace(regexp, 'full');
    node.xtag.emptyLayer.innerHTML = html.replace(regexp, 'empty');
  }

  function setWidth(node, value){
    var step = node.step;
    var width = Number(value) ? value : 0;
    node.setAttribute('rating', step ? node.items * ((value / step) / (100 / step)) : value);
    node.xtag.fullLayer.style.width = width + '%';
    node.xtag.fullInner.style.width = (100 / width) * 100 + '%';
  }

  xtag.register('x-rating', {
    content: '<div class="x-rating-layers-cell" unselectable="on">' +
               '<div class="x-rating-layers">' +
                 '<div class="x-rating-empty-layer"></div>' +
                 '<div class="x-rating-full-layer"><div></div></div>' +
                 '<input type="range" class="x-rating-range" />' +
               '</div>' +
             '</div>',
    lifecycle: {
      created: function() {
        this.xtag.range = this.querySelector('.x-rating-range');
        this.xtag.fullLayer = this.querySelector('.x-rating-full-layer');
        this.xtag.fullInner = this.xtag.fullLayer.firstChild;
        this.xtag.emptyLayer = this.querySelector('.x-rating-empty-layer');
        if (!this.items) this.items = 5;
        setWidth(this, this.value);
      }
    },
    events: {
      input: function(e){
        setWidth(this, e.target.value);
      },
      change: function(e){
        this.value = e.target.value;
      },
      contextmenu: function(e){
        e.preventDefault();
      }
    },
    accessors: {
      items: {
        attribute: {},
        set: function(){
          setBackground(this);
          if (this.step) this.xtag.range.style.left = '-' + (this.xtag.range.style.paddingRight = this.step / 2 + '%');
        }
      },
      name: {
        attribute: { property: 'range' }
      },
      value: {
        attribute: { property: 'range' },
        set: function(val){
          setWidth(this, val);
        }
      },
      step: {
        attribute: { property: 'range' }
      },
      disabled: {
        attribute: {
          boolean: true,
          property: 'range'
        }
      }
    }
  });

})();
