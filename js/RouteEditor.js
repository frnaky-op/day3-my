
class RouteEditor{

    /**
     * constructor
     * 
     */
    constructor( ){

        this.nodes = [];
        this.links = [];

        this.isShiftClicked = false;
        this.page = null;
        this.viewNode = null;
        this.activeObject = null;

        this.init();
    }

    init(){
        this.initEditor();
        this.bindeHundler();

        let nodes = JSON.parse( localStorage.getItem('nodes') )  || [];
        let links = JSON.parse( localStorage.getItem('links') )  || [];

        nodes.forEach( node => {
            let newNode = new Node( this , node.position.top , node.position.left );
            newNode.content = node.content;
        });

        links.forEach( link => {
            
            let node1 = this.nodes[ link.node1_id ];
            let node1direction = link.node1direction;

            let node2 = this.nodes[ link.node2_id ];
            let node2direction = link.node2direction;
            
            let label1 = nodes[ link.node1_id ].rolations[ node1direction ];
            let label2 = nodes[ link.node2_id ].rolations[ node2direction ];

            new Link( this , node1 , node2 , node1direction , node2direction , label1 , label2 );
        });

        if ( !this.nodes.length ) {
            new Node( this , $(window).innerHeight() / 2 , $(window).innerWidth() / 2 );
        }
    }

    initEditor(){
        CKEDITOR.replace( 'editor' , {
            height : $(".editMode").height() - 82 - 100
        })

        CKEDITOR.instances["editor"].on( "change" , () => {
            if ( this.activeObject ) {
                if ( this.activeObject instanceof Node ) {
                    this.activeObject.content = CKEDITOR.instances["editor"].getData();
                }
            }
        })
    }

    bindeHundler(){

        $('#app').click( e => {
            e.preventDefault();
            e.stopPropagation();
            $('.active').removeClass("active");
            $('.select').removeClass("select");
        });

        $('#switchmode span').click( e => {
            let mode = $(e.target).data("mode");
            if ( mode == 'view' ) {
                $('#switchmode .switch').removeClass('edit').addClass(mode);
                this.onViewMode();
            }else{
                this.offViewMode();
                $('#switchmode .switch').removeClass('view').addClass(mode);
            }
           
        });

        // close any mode
        $('.close').click( e => { $(e.target).parent().removeClass('show'); });

        // on input rolation name
        $('.rolControl input').on( 'input' , e => {
            if ( this.activeObject ) {
                if ( this.activeObject instanceof Node ) {
                    let direction = $(e.target).parent().data('direction');
                    this.activeObject.rolations[ direction ].label = $(e.target).val();
                }
            }
        });

        // click on next slide
        $('.view_rolGroup .viewRol').click( e => {
            this.changeNode( $(e.target).data('direction') );
        });

        $('#app').mousedown( e => {
            if ( this.isShiftClicked ) {
                e.preventDefault();
                e.stopPropagation();

                this.page = {
                    top : e.pageY,
                    left : e.pageX,
                }
                
            }
        })
        
        $(document).mousemove( e => {
            if ( this.page ) {
                e.preventDefault();
                e.stopPropagation();

                $('#app').css({
                    left: e.pageX - this.page.left,
                    top : e.pageY - this.page.top ,
                });
            }
        })

        $(document).mouseup( e => {
            if ( this.page ) {
                e.preventDefault();
                e.stopPropagation();

                $('#app').css({
                    left : 0,
                    top  : 0,
                });

                this.nodes.forEach( node => {
                    node.setPositions( node.position.top + e.pageY - this.page.top ,  node.position.left + e.pageX - this.page.left  )
                });
                this.page = null;
            }
        })


        $(document).keydown( e => {
            
            if ( SHIFT_KEY == e.keyCode ) {
                e.preventDefault();
                e.stopPropagation();
                $("#app").addClass( "grab" );
                this.isShiftClicked = true;
            }
        });
        
        $(document).keyup( e => {
            if ( SHIFT_KEY == e.keyCode ) {
                e.preventDefault();
                e.stopPropagation();

                $("#app").removeClass( "grab" );

                this.isShiftClicked = false;
            }
            
            if ( DELETE_KEY == e.keyCode ) {
                if ( this.activeObject ) {
                    this.activeObject.remove();
                }
            }
        });

        $(window).on( 'unload' , e => {
            localStorage.setItem( 'nodes' , JSON.stringify( this.nodes.map( node => node.export() )));
            localStorage.setItem( 'links' , JSON.stringify( this.links.map( link => link.export() )));
        });

        $('.full').click( e => {
            $(e.target).toggleClass('active');
            if ( $(e.target).hasClass('active') ) {
                $('.viewScreen').get(0).requestFullscreen();
                return;
            }
            document.exitFullscreen();
        });

        $(window).on( 'fullscreenchange' , e => {
            if ( document.fullscreenElement ) {
                $('.viewScreen').addClass('active');
                return;
            }
            $('.viewScreen').removeClass('active');
        });

    }

    onViewMode(){
        $('.viewmode').addClass('show');
        $('.editmode').hide(200);
        this.changeNode();
    }

    offViewMode(){
        $('.viewmode').removeClass('show');
        $('.editmode').show(200);
    }

    /* add new node and add link between them */
    addNode( node1 , node1direction ){

        let position = {
            left : node1.position.left,
            top  : node1.position.top
        };

        switch ( node1direction ) {
            case 1: position.top  -= NODE_SIZE * 3 ; break;
            case 2: position.left += NODE_SIZE * 3 ; break;
            case 3: position.top  += NODE_SIZE * 3 ; break;
            case 4: position.left -= NODE_SIZE * 3 ; break;
        }

        let node2 = new Node( this , position.top , position.left );

        let node2direction = DIRECTIONS[ node1direction ];
        new Link( this , node1 , node2 , node1direction , node2direction );

    }

    // edit node content and rolation names
    editNode( node ){

        this.activeObject = node;

        CKEDITOR.instances['editor'].setData( this.activeObject.content );

        $.each( this.activeObject.rolations , ( direction , rolation ) => {
            if ( rolation ) {
                $(`.rolControl[data-direction=${direction}] > input`).show(200).val( rolation.label || '' );
            }else{
                $(`.rolControl[data-direction=${direction}] > input`).hide();
            }
        })
        $(`.editMode`).addClass('show');
    }

    // change view content and controle slides
    changeNode( direction ){
        if ( direction ) {
            this.viewNode = this.viewNode.rolations[direction].link.getAnotherNode( this.viewNode );
        }else{
            this.viewNode = this.nodes[0];
        }
    
        let $prevSlide = $('#view_content .slide');
        let $nextSlide = $('#slideTemplate').clone().removeAttr('id');
        
        $prevSlide.addClass( 'slide-prev-'+ direction );
        $nextSlide.addClass( 'slide-next-'+ direction ).html( this.viewNode.content );

        $.each( this.viewNode.rolations , ( direction , rolation ) => {
            if ( rolation ) {
                $(`.view_rolGroup .viewRol[data-direction=${direction}]`).removeAttr('data-disabled').attr( 'data-title' , rolation.label || 'rolation' + direction );
            }else{
                $(`.view_rolGroup .viewRol[data-direction=${direction}]`).attr('data-disabled',true)
            }
        });
        
        $('#view_content').append( $nextSlide );
        setTimeout( () =>{
            $prevSlide.remove();
            $nextSlide.removeClass('slide-next-'+ direction);
        }, 1000 )
    }

}