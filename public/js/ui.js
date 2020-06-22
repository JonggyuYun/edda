var Browser = {chk : navigator.userAgent.toLowerCase()}
Browser = {ie : Browser.chk.indexOf('msie') != -1, ie6 : Browser.chk.indexOf('msie 6') != -1, ie7 : Browser.chk.indexOf('msie 7') != -1, ie8 : Browser.chk.indexOf('msie 8') != -1, ie9 : Browser.chk.indexOf('msie 9') != -1, ie10 : Browser.chk.indexOf('msie 10') != -1, ie11 : Browser.chk.indexOf('msie 11') != -1, opera : !!window.opera, safari : Browser.chk.indexOf('safari') != -1, safari3 : Browser.chk.indexOf('applewebkir/5') != -1, mac : Browser.chk.indexOf('mac') != -1, chrome : Browser.chk.indexOf('chrome') != -1, firefox : Browser.chk.indexOf('firefox') != -1}
var responCheck = Browser.ie7 || Browser.ie8;

// mobile case :: scroll size
var mobile = (/iphone|ipod|ipad|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
$(window).resize(function(){
    var winWidth = $(window).width();
    if (mobile || winWidth < 1000){
        $("html").attr('class','').addClass("mobile");
        ieBrowser()
    }else{
        $("html").attr('class','').addClass("pc");
        ieBrowser()
    }
}).resize();
function ieBrowser(){
    if (Browser.ie7) {
        $("html").addClass("ie7");
    } else if(Browser.ie8){
        $("html").addClass("ie8");
    } else if(Browser.ie9){
        $("html").addClass("ie9");
    } else if(Browser.ie10){
        $("html").addClass("ie10");
    } else {
        // mordern brow.
    } function lowMsg(){
        //document.write('<div style="position:absolute; top:0; right:0; border:3px solid black">ie7/8</div>');
    }
}

var edda = edda || {
    init:function() {
        edda.gnb.init();
        edda.main();
        edda.myConsult();
        edda.selectJs();
        edda.checkAll();
    },
    main:function(){
        if($(".container.main").length == 0){return;}
        var keyviIdx = $('.main .keyvi .keyvi-item'),
            $winWidth = $(window).width(),
            delta = 200,
            timer = null;
        /* 191226 */
        if($winWidth > 1240){
            keyviBxslider("202px", "370px", "460px", "252px", "420px", "510px");
            var accountantBxslider = $(".main .accountant .bxslider").bxSlider({
                speed:500,pause:2000, slideWidth:280,slideMargin:36,pager:false,controls:true,minSlides:4,maxSlides:4,moveSlides:1,responsive:false,
            });
        }else if($winWidth > 950){
            keyviBxslider("202px", "370px", "460px", "252px", "420px", "510px");
            var accountantBxslider = $(".main .accountant .bxslider").bxSlider({
                speed:500,pause:2000, slideWidth:280,slideMargin:36,pager:false,controls:true,minSlides:3,maxSlides:3,moveSlides:1,responsive:false,
            });
        }else if($winWidth > 768){
            keyviBxslider("202px", "370px", "460px", "252px", "420px", "510px");
            var accountantBxslider = $(".main .accountant .bxslider").bxSlider({
                speed:500,pause:2000, slideWidth:280,slideMargin:36,pager:false,controls:true,minSlides:2,maxSlides:2,moveSlides:1,responsive:false,
            });
        }else{
            keyviBxslider("105px", "185px", "230px", "130px", "210px", "255px");
            var accountantBxslider = $(".main .accountant .bxslider").bxSlider({
                speed:500,pause:2000, slideWidth:140,slideMargin:18,pager:false,controls:true,minSlides:1,maxSlides:1,moveSlides:1,responsive:false,
            });
        }
        $(window).resize(function(){
            animateDown("252px", "420px", "510px");
            clearTimeout(timer);
            timer = setTimeout(resizeDone, delta);
        });
        function resizeDone(){
            var winWidth = $(window).width();
            if(winWidth > 1240){
                keyviBxslider02("202px", "370px", "460px", "252px", "420px", "510px");
                accountantBxslider.reloadSlider({
                    speed:500,pause:2000, slideWidth:280,slideMargin:36,pager:false,controls:true,minSlides:4,maxSlides:4,moveSlides:1,responsive:false,
                });
            }else if(winWidth > 950){
                keyviBxslider02("202px", "370px", "460px", "252px", "420px", "510px");
                accountantBxslider.reloadSlider({
                    speed:500,pause:2000, slideWidth:280,slideMargin:36,pager:false,controls:true,minSlides:3,maxSlides:3,moveSlides:1,responsive:false,
                });
            }else if(winWidth > 768){
                keyviBxslider02("202px", "370px", "460px", "252px", "420px", "510px");
                accountantBxslider.reloadSlider({
                    speed:500,pause:2000, slideWidth:280,slideMargin:36,pager:false,controls:true,minSlides:2,maxSlides:2,moveSlides:1,responsive:false,
                });
            }else{
                keyviBxslider02("105px", "185px", "230px", "130px", "210px", "255px");
                accountantBxslider.reloadSlider({
                    speed:500,pause:2000, slideWidth:140,slideMargin:18,pager:false,controls:true,minSlides:1,maxSlides:1,moveSlides:1,responsive:false,
                });
            }
        }
        /* //191226 */
        function keyviBxslider(a,b,c,d,e,f){
            keyviSlider = $(".main .keyvi .bxslider").bxSlider({
                speed:500,pause:5000, auto:true,autoHover:true,pager:true,controls:false,
                onSliderLoad: function() {
                    animateUp(0, a, b, c);
                    keyviIdx.eq(0).find('h1 span').animate({margin:0},800);
                },
                onSlideAfter: function($slideElement, oldIndex, newIndex){
                    //console.log('onSlideAfter : '+oldIndex+' : '+newIndex); //not executed if useCSS: true
                    animateDown(d, e, f);
                    animateUp(newIndex, a, b, c);
                },
            });
        }
        function keyviBxslider02(a,b,c,d,e,f){
            keyviSlider.reloadSlider({
                speed:500,pause:5000, auto:true,autoHover:true,pager:true,controls:false,
                onSliderLoad: function() {
                    animateDown(d, e, f);
                    animateUp(0, a, b, c);
                    keyviIdx.eq(0).find('h1 span').animate({margin:0},800);
                },
                onSlideAfter: function($slideElement, oldIndex, newIndex){
                    //console.log('onSlideAfter : '+oldIndex+' : '+newIndex); //not executed if useCSS: true
                    animateDown(d, e, f);
                    animateUp(newIndex, a, b, c);
                },
            });
        }
        function animateUp(idx, a, b, c){
            keyviIdx.eq(idx).find('h1').animate({opacity:1, top:a},300);
            keyviIdx.eq(idx).find('.bar').animate({opacity:1, top:b},500);
            keyviIdx.eq(idx).find('p').animate({opacity:1, top:c},700);
        }
        function animateDown(a, b, c){
            keyviIdx.find('h1').animate({opacity:0, top:a},0);
            keyviIdx.find('.bar').animate({opacity:0, top:b},0);
            keyviIdx.find('p').animate({opacity:0, top:c},0);
        }
    },//main
    myConsult:function(){
        if($(".container.my_consult .accountant").length == 0){return;}
        var $winWidth = $(window).width();
        if($winWidth > 1240){
            myConsultBxslider = $(".my_consult .accountant .bxslider").bxSlider({
                speed:500,pause:2000, slideWidth:380,slideMargin:50,pager:false,controls:false,minSlides:3,maxSlides:3,moveSlides:1,responsive:false,
            });
        }else if($winWidth > 900){
            myConsultBxslider = $(".my_consult .accountant .bxslider").bxSlider({
                speed:500,pause:2000, slideWidth:380,slideMargin:50,pager:false,controls:true,minSlides:2,maxSlides:2,moveSlides:1,responsive:false,
            });
        }else if($winWidth > 768){
            myConsultBxslider = $(".my_consult .accountant .bxslider").bxSlider({
                speed:500,pause:2000, slideWidth:380,slideMargin:50,pager:false,controls:true,minSlides:1,maxSlides:1,moveSlides:1,responsive:false,
            });
        }else{
            myConsultBxslider = $(".my_consult .accountant .bxslider").bxSlider({
                speed:500,pause:2000, slideWidth:190,slideMargin:25,pager:false,controls:true,minSlides:1,maxSlides:1,moveSlides:1,responsive:false,
            });
        }
        $(window).resize(function(){
            var winWidth = $(window).width();
            if(winWidth > 1240){
                myConsultBxslider.reloadSlider({
                    speed:500,pause:2000, slideWidth:380,slideMargin:50,pager:false,controls:false,minSlides:3,maxSlides:3,moveSlides:1,responsive:false,
                });
            }else if(winWidth > 900){
                myConsultBxslider.reloadSlider({
                    speed:500,pause:2000, slideWidth:380,slideMargin:50,pager:false,controls:true,minSlides:2,maxSlides:2,moveSlides:1,responsive:false,
                });
            }else if(winWidth > 768){
                myConsultBxslider.reloadSlider({
                    speed:500,pause:2000, slideWidth:380,slideMargin:50,pager:false,controls:true,minSlides:1,maxSlides:1,moveSlides:1,responsive:false,
                });
            }else{
                myConsultBxslider.reloadSlider({
                    speed:500,pause:2000, slideWidth:190,slideMargin:25,pager:false,controls:true,minSlides:1,maxSlides:1,moveSlides:1,responsive:false,
                });
            }
        })
    },//my_consult
    selectJs:function(){
        if($(".select-box").length == 0){return;}
        var selectTarget = $(".select-box >select");
        selectTarget.on({
            click: function() {
                $( this ).parent().addClass("focus");
            },focus: function(){
                $( this ).parent().addClass("focus");
            }, mouseleave: function() {
                $( this ).parent().removeClass("focus");
            }, focusout: function() {
                $( this ).parent().removeClass("focus");
            }
        });
        $(".select-box").on("mouseleave", function(){
            $( this ).removeClass("focus");
        });
        selectTarget.change(function(){
            var selectName = $(this).children("option:selected").text();
            $(this).siblings("label").text(selectName);
            $(this).parent().removeClass("focus");
        });
    },//selectJs
    checkAll:function(){
        if($(".all-check-wrap").length == 0){return;}
        $("#checkAll").on('click', function(){
            var checkBoxes = $("input[name='businessdistrict']");
            checkBoxes.prop("checked", $(this).prop("checked"));
        });
        $("input[name='businessdistrict']").on('click', function(){
            var $length = $("input[name='businessdistrict']").length,
                $checked = $("input[name='businessdistrict']:checked").length;
            if($length === $checked){
                $("#checkAll").prop("checked", true);
            }else{
                $("#checkAll").prop("checked", false);
            }
        });
    },//checkAll
    gnb: {
        init: function(){
            $nav = $("nav");
            $btnNav = $(".btn-nav");
            this.event();
        },
        event: function(){
            $btnNav.on({
                click: function(){
                    ($btnNav.hasClass("active"))? edda.gnb.gnb_close() : edda.gnb.gnb_open();
                }, mouseleave: function(){
                    edda.gnb.gnb_close();
                }
            });
            $nav.on({
                mouseenter: function(){
                    $btnNav.addClass("active");
                    $(this).stop();
                }, mouseleave: function(){
                    edda.gnb.gnb_close();
                }
            });
        },
        gnb_open:function(){
            console.log("open")
            $btnNav.addClass("active");
            $nav.slideDown(200);
        },
        gnb_close:function(){
            console.log("close")
            $nav.slideUp(400, function(){
                $btnNav.removeClass("active");
            });
        }
    },//gnb

    layerOpen:function(e, ele){
        var name_id = $('#'+ele),
            refFocusEl = e,
            $htmlH = $("html").scrollTop();
        name_id.attr('tabindex', '0').fadeIn().focus();
        name_id.append('<a href="#" class="loop">포커스이동</a>');
        $('.loop').focus(function(){
            name_id.attr('tabindex', '0').fadeIn().focus();
        });
        $('html,body').css({'overflow':'hidden','position':'fixed','height':'100%'});
        $(window).resize(function(){
            var win_h = $(window).outerHeight();
            var win_w = $(window).outerWidth();
            var pop_h = name_id.find('.pop-layer').outerHeight();
            var pop_w = name_id.find('.pop-layer').outerWidth();
            var position_top =  (win_h - pop_h) / 2;
            var position_left = (win_w - pop_w) / 2;
            if(position_top <= 0){position_top = 0;}
            if(position_left <= 0){position_left = 0;}
            name_id.find('.pop-layer').css({'top':position_top,'left':position_left});
            pop_h >= win_h ? $('.dimmed').css('height',pop_h) : $('.dimmed').css('height', 100 + "%");
            pop_w >= win_w ? $('.dimmed').css('width',pop_w) : $('.dimmed').css('width', 100 + "%");
        }).resize();
        //close
        name_id.find('.btn-close, .dimmed').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            refFocusEl.focus();
            $('.loop').remove();
            $('.wrap-layer-popup').fadeOut();
            $('html,body').attr('style','');
            $("html").scrollTop($htmlH)
        });
    },//layer_open
};

window.onload = function(){
    edda.init();
};