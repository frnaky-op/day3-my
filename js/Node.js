
class Node{
    
    constructor( routeEditor , top , left ){
        
        this.routeEditor = routeEditor;
        this.$el = $('#templateNode').clone().removeAttr('id');
        this.position = { top : top , left: left }
        this.rolations = {
            1 : null,
            2 : null,
            3 : null,
            4 : null,
        };
        this.page = null;
        this.$dragEl = null;
        this.content = "";
        this.init();
    }


    init(){
        $("#app").append( this.$el );
        this.routeEditor.nodes.push( this );
        this.setPositions( this.position.top , this.position.left  );
        this.bindHundlers();
    }




    bindHundlers(){

        this.$el.click( (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        this.$el.dblclick( (e) => {
            e.preventDefault();
            e.stopPropagation();
            $( '.select' ).removeClass('select');
            this.$el.addClass( 'active' ).siblings().removeClass('active');
        });

        this.$el.find('.rol').click( e => {
            e.preventDefault();
            e.stopPropagation();
            
            let direction = $(e.target).data('direction');
            if ( this.rolations[ direction ] ) {
                this.rolations[ direction ].link.getAnotherNode(this).$el.dblclick();
            }else this.routeEditor.addNode( this , direction );

        });

        this.$el.mousedown( (e) => {
            if ( !this.routeEditor.isShiftClicked ) {
                e.preventDefault();
                e.stopPropagation();

                if ( !this.$el.hasClass('active') ) {
                    
                    this.page = {
                        left : e.pageX - this.position.left ,
                        top  : e.pageY - this.position.top ,
                    }
                }

                this.$el.addClass('select').siblings().removeClass('select');
                this.routeEditor.activeObject = this;
            }
        })

        $("#app").mousemove( (e) => {
            if ( this.$dragEl ) {
                e.preventDefault();
                e.stopPropagation();

                $('.node').addClass('active');

                this.$dragEl.css({
                    left : e.pageX,
                    top  : e.pageY,
                })
                return;
            }
            if ( this.page ) {
                e.preventDefault();
                e.stopPropagation();
                this.setPositions( e.pageY - this.page.top , e.pageX - this.page.left );   
            }

        });

        $("#app").mouseup( (e) => {
            if ( this.$dragEl ) {
                e.preventDefault();
                e.stopPropagation();
                
                if ( $(e.target).hasClass('rol') ) {
                    
                    let node1 = this;
                    let node1direction = this.$dragEl.data('direction');

                    let node2 = this.routeEditor.nodes.find( node => node.$el[0] === $(e.target).parent().parent()[0] );
                    let node2direction = $(e.target).data('direction');
                    
                    if ( node1 != node2 || !node1.rolations[ node1direction ] || !node2.rolations[ node2direction ] ) {
                        new Link( this.routeEditor , node1 , node2 , node1direction , node2direction );
                    }

                }
                
                this.$dragEl.remove();
                this.$dragEl = null;

            }
            if ( this.page ) {
                e.preventDefault();
                e.stopPropagation();
                this.page = null;
            }
        });

        // edit node content and rolations label
        this.$el.find('.btn-delete').click( e => {
            e.preventDefault();
            e.stopPropagation();
            this.remove();
        });

        // edit node content and rolations label
        this.$el.find('.btn-edit').click( e => {
            e.preventDefault();
            e.stopPropagation();
            this.routeEditor.editNode( this );
        });

        this.$el.find('.rol').mousedown( e => {
            if ( this.routeEditor.isShiftClicked ) {
                e.preventDefault();
                e.stopPropagation();

                this.$dragEl = $('#dragTemplate').clone().removeAttr('id');
                this.$dragEl.attr('data-direction' , $(e.target).data('direction') );
                this.$dragEl.css({
                    left : e.pageX,
                    top  : e.pageY,
                });
                $('#app').append(this.$dragEl);
            }
        });

    }

    setPositions( top , left ){
        this.position.top = top;
        this.position.left = left;
        this.$el.css( this.position );
        $.each( this.rolations , ( direction , rolation ) => {
            if ( rolation ) {
                rolation.link.draw();
            }
        });
    }

    getPointPosition( direction ){

        let left = this.position.left,
            top = this.position.top;

        switch ( direction ) {
            case 1: top -= NODE_SIZE / 2; break;
            case 2: left += NODE_SIZE / 2; break;
            case 3: top += NODE_SIZE / 2; break;
            case 4: left -= NODE_SIZE / 2; break;
        }

        return {
            left,
            top
        };
    }

    remove( ) {
        
        if ( this.routeEditor.nodes.length < 2 ) return;
        let index = this.routeEditor.nodes.indexOf( this );

        if ( -1 < index ) this.routeEditor.nodes.splice( index , 1 );
        
        this.$el.remove();
    
        $.each( this.rolations , ( direction , rolation ) => {
            if ( rolation ) rolation.link.remove();
        });
    }

    export(){
        let rolations = {
            1: this.rolations[1] ? this.rolations[1].label : null,
            2: this.rolations[2] ? this.rolations[2].label : null,
            3: this.rolations[3] ? this.rolations[3].label : null,
            4: this.rolations[4] ? this.rolations[4].label : null,
        };
        return {
            content : this.content,
            rolations,
            position: this.position
        }
    }

}