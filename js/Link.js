
class Link{
    
    constructor( routeEditor , node1 , node2 , node1direction , node2direction , label1 = '' , label2 = '' ){
        this.routeEditor = routeEditor;
        this.node1 = node1;
        this.node2 = node2;
        this.node1direction = node1direction;
        this.node2direction = node2direction;
    
        this.label1 = label1;
        this.label2 = label2;

        this.$el = $('#linkTemplate').clone().removeAttr('id');

        this.init();
    }

    init(){
        this.bindHundler();
        $('#app').prepend( this.$el );
        this.routeEditor.links.push( this );
        
        this.node1.rolations[ this.node1direction ] = {
            label : this.label1,
            link  : this,
        }
        this.node2.rolations[ this.node2direction ] = {
            label : this.label2,
            link  : this,
        }

        this.draw();
    }

    bindHundler(){
        this.$el.click( e => {
            e.preventDefault();
            e.stopPropagation();
            $('.select').removeClass('select');
            this.$el.addClass('active').siblings('.active').removeClass('active')
            this.routeEditor.activeObject = this;
        });

        this.$el.find('.delete').click( e => {
            this.remove()
        });

    }

    draw(){

        let node1position = this.node1.getPointPosition( this.node1direction );
        let node2position = this.node2.getPointPosition( this.node2direction );

        let position = {
            top : ( node1position.top + node2position.top ) /2 ,
            left : ( node1position.left + node2position.left ) /2 ,
        }
        
        this.$el.css(position)
        
        let width = Math.sqrt( Math.pow( node1position.left - node2position.left , 2 ) + Math.pow( node1position.top - node2position.top  , 2) )
    
        this.$el.css({
            width,
        })

        let rotate = Math.atan2( node1position.top - node2position.top , node1position.left - node2position.left ) / Math.PI * 180;
        
        this.$el.css({
            transform : `translate(-50%,-50%) rotate(${rotate}deg)`
        });

    }

    getAnotherNode( node ){
        return node == this.node1 ? this.node2 : this.node1;
    }

    remove(){
        let index = this.routeEditor.links.indexOf( this );
        if( -1 < index ) this.routeEditor.links.splice( index , 1 );

        this.$el.remove();

        this.node1.rolations[ this.node1direction ] = null;
        this.node2.rolations[ this.node2direction ] = null;
    
    }

    export(){
        return{
            node1_id : this.routeEditor.nodes.indexOf( this.node1 ),
            node1direction : this.node1direction,
            node2_id : this.routeEditor.nodes.indexOf( this.node2 ),
            node2direction : this.node2direction,
            label1 : this.label1,
            label2 : this.label2,
        }
    }

}