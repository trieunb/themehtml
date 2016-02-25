window.timber = window.timber || {};

timber.cache = {
  // General
  html: $('html'),
  body: $('body'),

  // Product Page
  mainImage: $('#productPhotoImg'),
  thumbImages: $('#productThumbs').find('a.product-photo-thumb'),
  newImage: null
}

timber.init = function () {
  timber.cache.html.removeClass('no-js').addClass('js');

  // Run on load
  timber.productImageSwitch();
}

timber.productImageSwitch = function () {
  if ( !timber.cache.thumbImages.length ) {
    return;
  }

  // Switch the main image with one of the thumbnails
  // Note: this does not change the variant selected, just the image
  timber.cache.thumbImages.on('click', function(e) {
    e.preventDefault();
    timber.cache.newImage = $(this).attr('href');
    timber.cache.mainImage.attr({ src: timber.cache.newImage });
  });
}

// Initialize Timber's JS on docready
$(function() {
  window.timber.init();
});
//Hide quick view function
function hideQuickview() {
	jQuery('.quickshadow').removeClass('open');
	setTimeout(function(){
		jQuery('body').removeClass('quickview');
	}, 500);
}
function showCartNotic(){
	setTimeout(function(){
		jQuery('.cartnotic').addClass('open');
	}, 1000);
	setTimeout(function(){
		jQuery('.cartnotic').removeClass('open');
	}, 5000);
}
function removeSmallCart(variantId) {
	Shopify.removeItem(variantId, function(cart){
		//small cart item animate
		jQuery('#item-' + variantId).css({'overflow': 'hidden', '-webkit-transition': 'all 0.3s ease', 'transition': 'all 0.3s ease'});
		jQuery('#item-' + variantId).animate({'height': '0', 'margin-bottom': '0'});
		//cart page item animate
		jQuery('.item-' + variantId).css({'overflow': 'hidden', '-webkit-transition': 'all 0.3s ease', 'transition': 'all 0.3s ease'});
		jQuery('.item-' + variantId).animate({'height': '0', 'padding-bottom': '0', 'padding-top': '0'});
		
		setTimeout(function(){
			//remove item in small cart
			jQuery('#item-' + variantId).remove();
			//remove item in cart page
			jQuery('.item-' + variantId).remove();
		}, 1000);

		//update small cart values
		jQuery('#cartCount').html(cart.item_count);
		jQuery('#cartCost').html(Shopify.formatMoney( cart.total_price ).replace(' ',''));
		//update cart page values
		jQuery('.cart-subtotal--price').html(Shopify.formatMoney( cart.total_price ).replace(' ',''));
		
		//update links, heading for empty cart
		if(cart.item_count==0){
			//small cart
			jQuery('.small-cart-empty-heading').css('display', 'block');
			jQuery('.smart-cart-shop-link').css('display', 'block');
			jQuery('.smart-cart-checkout-link').css('display', 'none');
			jQuery('.smart-cart-cart-link').css('display', 'none');
			//cart page
			jQuery('.cart-info').html('<h2>Your cart is empty.</h2><p><a class="btn" href="/collections/all">Continue Shopping</a></p>');
		}
	});
}
function removeButtonCall(){
	jQuery('.small-cart-remove').each(function(){
		jQuery(this).click(function(event){
			event.preventDefault();
			var variantId = jQuery(this).attr('data-id');
			
			//remove small cart line
			removeSmallCart(variantId);
		});
	});
}
function updateSmallCart(cart) {
	jQuery('#cartCount').html(cart.item_count);
	jQuery('#cartCost').html(Shopify.formatMoney( cart.total_price ).replace(' ',''));
	
	//change heading and links
	jQuery('.small-cart-empty-heading').css('display', 'none');
	jQuery('.smart-cart-shop-link').css('display', 'none');
	jQuery('.smart-cart-checkout-link').css('display', 'block');
	jQuery('.smart-cart-cart-link').css('display', 'block');
	var cartItemRows = '';
	//update small cart items
	for(i=0;i<cart.items.length;i++) {
		cartItemRows+= '<div class="small-cart-row grid small-cart-product" id="item-'+cart.items[i].variant_id+'">';
		cartItemRows+= '<div class="grid-item large--one-quarter medium--one-quarter small--one-quarter small-cart-image">';
		cartItemRows+= '<a href="'+cart.items[i].url+'"><img src="'+cart.items[i].image+'" alt="'+cart.items[i].title+'"></a>';
		cartItemRows+= '</div>';
		cartItemRows+= '<div class="grid-item large--three-quarters medium--three-quarters small--three-quarters small-cart-product-info">';
		cartItemRows+= '<a class="small-cart-title" href="'+cart.items[i].url+'">'+cart.items[i].title+'</a>';
		cartItemRows+= '<span class="small-cart-price">'+Shopify.formatMoney(cart.items[i].price).replace(' ','')+'<span class="small-cart-quantity"> x '+cart.items[i].quantity+'</span></span>';
		cartItemRows+= '<a class="small-cart-remove" href="/cart/change?line='+cart.items[i].variant_id+'&amp;quantity=0" data-id="'+cart.items[i].variant_id+'" title="Remove"><i class="fa fa-times-circle"></i></a>';
		cartItemRows+= '</div>';
		cartItemRows+= '</div>';
	}
	jQuery('.small-cart-rows').html(cartItemRows);
	removeButtonCall();
}

function roadaddItem(variant_id, quantity, callback) {
  var quantity = quantity || 1;
  var params = {
    type: 'POST',
    url: '/cart/add.js',
    data: 'quantity=' + quantity + '&id=' + variant_id,
    dataType: 'json',
    success: function(line_item) { 
      if ((typeof callback) === 'function') {
        callback(line_item);
      }
      else {
        Shopify.onItemAdded(line_item);
      }
    },
    error: function(XMLHttpRequest, textStatus) {
		
		var data = eval('(' + XMLHttpRequest.responseText + ')');
		if (!!data.message) {
			
			if(!(jQuery('.cart_message').length > 0)){
				jQuery('body').append('<div class="cart_message_shadow"></div><div class="cart_message"><span class="close"><i class="fa fa-times-circle-o"></i></span>'+data.description+'<br />For ordering more, please contact us at <a href="mailto:support@yourdomain.com">support@yourdomain.com</a></div>');
			}
			jQuery('.cart_message .close').click(function(){
				jQuery('.cart_message').fadeOut(300, function(){
					jQuery('.cart_message').remove();
					jQuery('.cart_message_shadow').remove();
				});
			});
			jQuery('.cart_message_shadow').click(function(){
				jQuery('.cart_message').fadeOut(300, function(){
					jQuery('.cart_message').remove();
					jQuery('.cart_message_shadow').remove();
				});
			});
		}
    }
  };
  jQuery.ajax(params);
}

jQuery(document).ready(function(){
	//Mobile menu
	jQuery('.nav-toggler').click(function(){
		if(jQuery('.mobile-nav').hasClass('open')) {
			jQuery('.mobile-nav').removeClass('open');
		} else {
			jQuery('.mobile-nav').addClass('open');
		}
	});
	//set the height of all li.parent items
	jQuery('.mobile-nav li.parent').each(function(){
		jQuery(this).css({'height': 41, 'overflow': 'hidden'}); // add 1 pixel for border-top => 41 pixels
	});
	//process the parent items
	jQuery('.mobile-nav li.parent').each(function(){
		var parentLi = jQuery(this);
		var dropdownUl = parentLi.find('.site-nav--dropdown').first();
		
		//add arrow to parent menu item
		parentLi.find('a').first().after('<i class="fa fa-angle-down"></i>');
		
		parentLi.find('.fa').first().bind('click', function(){
			//set height is auto for all parents dropdown
			parentLi.parents('li.parent').css('height', 'auto');
		
			var dropdownUlheight = dropdownUl.outerHeight() + 41;
			
			if(parentLi.hasClass('opensubmenu')) {
				parentLi.removeClass('opensubmenu');
				parentLi.animate({'height': 41}, 'fast');
				parentLi.find('.fa').first().removeClass('fa-angle-up');
				parentLi.find('.fa').first().addClass('fa-angle-down');
			} else {
				parentLi.addClass('opensubmenu');
				parentLi.animate({'height': dropdownUlheight}, 'fast');
				parentLi.find('.fa').first().addClass('fa-angle-up');
				parentLi.find('.fa').first().removeClass('fa-angle-down');
			}
		});
	});
	//Small cart toggle
	jQuery('.header-cart').bind('mouseover', function(event){
		if(jQuery(window).width() > 1024){ 
			jQuery('.small-cart').addClass('open');
		}
	});
	jQuery('.small-cart').bind('mouseover', function(){
		jQuery('.small-cart').addClass('hover');
	});
	jQuery('.small-cart').bind('mouseleave', function(){
		jQuery('.small-cart').removeClass('hover');
	});
	jQuery('.header-cart').bind('mouseleave', function(event){
		if(jQuery(window).width() > 1024){
			window.setTimeout(function(){
				if(jQuery('.small-cart').hasClass('hover')==false){
					jQuery('.small-cart').removeClass('open');
				}
			}, 500);
		}
	});
	var clickTime=0;
	jQuery('.header-cart').bind('click', function(event){
		if(jQuery(window).width() < 1025){
			if(jQuery('.small-cart').hasClass('open')) {
				jQuery('.small-cart').removeClass('open');
			} else {
				jQuery('.small-cart').addClass('open');
			}
		}
	});
	// Ajax add to cart for product page
	jQuery('#addToCart').click(function(event){
		event.preventDefault();
		var selectedVariant = jQuery('#productSelect option:selected').val();
		var selectedQty = jQuery('#quantity').val();

		roadaddItem(selectedVariant, selectedQty, function(){
			jQuery.getJSON('/cart.js', function (cart, textStatus) {
				if(textStatus=='success'){
					//update small cart
					updateSmallCart(cart);
					//showCartNotic();
					//prepare the popup after added to cart
					var popupContent = '<div class="popupATCshadow"></div><div class="popupATC"><span class="close"><i class="fa  fa-times-circle-o"></i></span>';
						popupContent += '<h1>SHOPPING CART</h1>';
						popupContent += '<div class="pp-info">';
							popupContent += '<h2>JUST ADDED TO YOUR CART</h2>';
							popupContent += jQuery('#productPhoto').html();
							popupContent += '<h3>'+jQuery('.product-details .product-title').html()+' ('+jQuery('.single-option-selector option:selected').html()+')</h3>';
							popupContent += '<span>Qty: '+selectedQty+'</span>';
							popupContent += '<span>Price: '+jQuery('#productPrice').html()+'</span>';
						popupContent += '</div>';
						popupContent += '<div class="pc-info">';
							popupContent += '<h3>Shopping Cart:</h3>';
							if(cart.item_count==1){
								popupContent += '<p>'+cart.item_count+' item</p>';
							} else {
								popupContent += '<p>'+cart.item_count+' items</p>';
							}
							popupContent += '<p class="total">Total: '+Shopify.formatMoney( cart.total_price ).replace(' ','')+'</p>';
							popupContent += '<a href="/collections">Continue Shopping</a>';
							popupContent += '<a href="/cart">View Cart</a>';
						popupContent += '</div>';
					popupContent += '</div>';
					jQuery('body').append(popupContent);
					jQuery('.popupATC .close').click(function(){
						jQuery('.popupATC').fadeOut(300, function(){
							jQuery('.popupATC').remove();
							jQuery('.popupATCshadow').remove();
						});
					});
					jQuery('.popupATCshadow').click(function(){
						jQuery('.popupATC').fadeOut(300, function(){
							jQuery('.popupATC').remove();
							jQuery('.popupATCshadow').remove();
						});
					});
				}
			});
		});
		
	});
	//Small cart remove button
	removeButtonCall();
	//Product quantity add/minus buttons
	jQuery('.js--qty-adjuster.js--minus').click(function(){
		var currentQuantity = jQuery('#quantity').val();
		if(currentQuantity>1){
			currentQuantity--;
			jQuery('#quantity').val(currentQuantity);
		}
		//for cart page
		var productRel = jQuery(this).attr('rel');
		var quantityRel = jQuery('#'+productRel).val();
		if(quantityRel>0){
			quantityRel--;
			jQuery('#'+productRel).val(quantityRel);
		}
	});
	jQuery('.js--qty-adjuster.js--add').click(function(){
		var currentQuantity = jQuery('#quantity').val();
		currentQuantity++;
		jQuery('#quantity').val(currentQuantity);
		//for cart page
		var productRel = jQuery(this).attr('rel');
		var quantityRel = jQuery('#'+productRel).val();
		quantityRel++;
		jQuery('#'+productRel).val(quantityRel);
		
	});
	//Product grid image hover
	jQuery('.product-grid-images').each(function(){
		jQuery(this).bind('mouseover click', function(){
			jQuery(this).addClass('hover');
		});
		jQuery(this).bind('mouseleave ', function(){
			jQuery(this).removeClass('hover');
		});
	});
	//Fancybox
	jQuery('.fancybox').fancybox({
		openEffect 		: 'elastic',
		closeEffect		: 'elastic',
		prevEffect		: 'elastic',
		nextEffect		: 'elastic',
		closeBtn		: false,
		helpers		: {
			title: null,
			buttons	: {}
		}
	});
	//Main menu
	jQuery('.site-nav li').each(function(){
		jQuery(this).bind('mouseover click', function(){
			jQuery(this).addClass('hover');
		});
		jQuery(this).bind('mouseleave', function(){
			jQuery(this).removeClass('hover');
		});
	});
	jQuery('.site-nav li.level-1').each(function(){
		if(jQuery(this).hasClass('active')) {
			jQuery(this).closest('li.level-0').addClass('site-nav--active');
		}
	});
	jQuery('.site-nav li.level-2').each(function(){
		if(jQuery(this).hasClass('active')) {
			jQuery(this).closest('li.level-1').addClass('active');
			jQuery(this).closest('li.level-0').addClass('site-nav--active');
		}
	});
	
	// Slider
	jQuery('.flexslider').flexslider({
		animation: "fade",
		controlNav:  true ,
		directionNav:  true ,
		slideshowSpeed: 7000,
		animationSpeed: 600,
		slideshow: true,
		start: function(slider){
			jQuery('body').removeClass('loading');
			jQuery('.slide-title').css({'-webkit-transition': 'all 0.5s ease','transition': 'all 0.5s ease', 'opacity': '0', 'transform': 'translate(0, -120px)', '-webkit-transform': 'translate(0, -120px)'});
			jQuery('.slide-desc').css({'-webkit-transition': 'all  0.5s ease', 'transition': 'all  0.5s ease', 'opacity': '0', 'transform': 'translate(-150px, 0)', '-webkit-transform': 'translate(-150px, 0)'});
			
			setTimeout(function(){
				jQuery('.slide-title').css({'opacity': '1', '-webkit-transform': 'translate(0, 0) skew(0deg,0deg)', 'transform': 'translate(0, 0) skew(0deg,0deg)'});
				jQuery('.slide-desc').css({'opacity': '1', '-webkit-transform': 'translate(0, 0) skew(0deg,0deg)', 'transform': 'translate(0, 0) skew(0deg,0deg)'});
			}, 500);
        } ,
		after: function(){
			jQuery('.slide-title').css({'opacity': '1', '-webkit-transform': 'translate(0, 0) skew(0deg,0deg)', 'transform': 'translate(0, 0) skew(0deg,0deg)'});
			setTimeout(function(){
				jQuery('.slide-desc').css({'opacity': '1', '-webkit-transform': 'translate(0, 0) skew(0deg,0deg)', 'transform': 'translate(0, 0) skew(0deg,0deg)'});
			}, 500);
			
		},
		before: function(){
			jQuery('.slide-title').css({'opacity': '0', '-webkit-transform': 'translate(0, -120px) skew(30deg,30deg)', 'transform': 'translate(0, -120px) skew(30deg,30deg)'});
			jQuery('.slide-desc').css({'opacity': '0', '-webkit-transform': 'translate(-150px, 0) skew(30deg,30deg)', 'transform': 'translate(-150px, 0) skew(30deg,30deg)'});
		}
	});
	
	// Collections
	jQuery('.collections .grid-item').each(function(){
		jQuery(this).bind('mouseover click', function(){
			jQuery(this).addClass('hover');
		});
		jQuery(this).bind('mouseleave', function(){
			jQuery(this).removeClass('hover');
		});
	});
	
	jQuery('.collection-desc li').each(function(){
		var subcatLink = jQuery(this).find('a').html();
		jQuery(this).find('a').html('<i class="fa  fa-angle-right"></i>' + subcatLink);
	});
	
	// Carousel collections
	jQuery('.frontpage-collections .grid-item').each(function(){
		jQuery(this).css({'clear': 'none'});
	});
	jQuery('.frontpage-collections').flexslider({
		selector: ".collections > .grid-item",
		animation: "slide",
		slideshow: true, 
		animationLoop: true,
		
		itemWidth: 370,
		itemMargin: 30,
		
		move: 1,
		prevText: "",
		nextText: "",
		controlNav: false,
		directionNav: true,
		slideshowSpeed: 7000,
		animationSpeed: 600,
	});
	
	// Carousel brand logos
	jQuery('.carousellogos').flexslider({
		animation: "slide",
		slideshow: true, 
		animationLoop: true,
		itemWidth: 210,
		itemMargin: 30,
		move: 1,
		prevText: "",
		nextText: "",
		controlNav: false,
		directionNav: true,
		slideshowSpeed: 7000,
		animationSpeed: 600,
	});
	
	// Carousel product thumbs
	
	jQuery('.product-thumbs-carousel').flexslider({
		animation: "slide",
		slideshow: false, 
		animationLoop: true,
		itemWidth: 110,
		itemMargin: 10,
		move: 1,
		prevText: "",
		nextText: "",
		controlNav: false,
		directionNav: true,
		slideshowSpeed: 7000,
		animationSpeed: 600,
	});

	// Quick view
	jQuery('.quick-view').each(function(){
		var thisQuickLink = jQuery(this);
		
		thisQuickLink.click(function(event){
			event.preventDefault();
			var thisRel = thisQuickLink.attr('rel');
			
			jQuery('.quickshadow').addClass('open');
			jQuery('.quick-modal').addClass('loading');
			jQuery('#quick-modal').html('');

			jQuery.getJSON('/products/'+thisRel+'.js', function(product) {
				var responseContent = '';
				var productImages = '';
				productImages += '<div id="quickviewslider" class="flexslider">';
				productImages += '<ul class="slides">';
				for(idx=0;idx<product.images.length;idx++) {
					productImages += '<li><img class="quickview-image" src="'+product.images[idx]+'" alt="" /></li>';
				}
				productImages += '</ul>';
				productImages += '</div>';
			
				var productVariants = '';
				var productVariantsCss = 'display: none;';
				if(product.variants.length > 1){
					productVariantsCss = 'display: block;';
				}
				var productInventory = false;
				if(product.available){
              		productInventory = true;
             	}
				productVariants += '<select class="product-variants" id="productSelectQV" name="id" style="'+productVariantsCss+'">';
				for(idx=0;idx<product.variants.length;idx++) {
					productVariants +='<option rel="'+Shopify.formatMoney(product.variants[idx].price).replace(' ','')+'" compare="'+Shopify.formatMoney(product.variants[idx].compare_at_price).replace(' ','')+'" value="'+product.variants[idx].id+'">'+product.variants[idx].title+'</option>';
				}
				productVariants += '</select>';
				responseContent += '<div class="quick-header"><h1>'+product.title+'</h1></div>';
				responseContent += '<div class="grid-item quickview-image-grid large--one-half">';
					responseContent += '<div class="product-images">'+productImages+'</div>';
				responseContent += '</div>';
				responseContent += '<div class="grid-item large--one-half">';
					responseContent += '<div class="product-desc">'+product.description+'</div>';
					responseContent += '<form id="addToCartFormQV" enctype="multipart/form-data" method="post" action="/cart/add">';
					if( product.compare_at_price != null ){
						var priceCompare = '<h4 id="price-quick-compare">'+Shopify.formatMoney( product.compare_at_price ).replace(' ','')+'</h4>';
					} else {
						var priceCompare = '';
					}
					responseContent += '<div class="product-prices"><h2 id="price-quick">'+Shopify.formatMoney( product.price, "" ).replace(' ','')+'</h2>'+priceCompare+'</div>';
					if(productInventory){
						responseContent += productVariants;
					}
					responseContent += '<div class="quantity-add">';
					responseContent += '<div class="js-qty"><input type="text" id="quantityqv" name="quantity" pattern="[0-9]*" aria-label="quantity" data-id="" min="1" value="1" class="js--num"><span class="js--qty-adjuster js--add">+</span><span class="js--qty-adjuster js--minus">-</span></div>';
					
					if(productInventory){
						responseContent += '<input id="addToCartQV" class="btn" type="submit" value="Add to Cart" name="add">';
					} else {
						responseContent += '<input type="submit" value="Sold Out" id="addToCartQV" class="btn disabled" name="add" disabled="">';
					}
					responseContent += '</div>';
					responseContent += '</form>';
				responseContent += '</div>';
				responseContent += '<div class="clearfix"></div>';
				
				jQuery('#quick-modal').html(responseContent);
				jQuery('.quick-modal').removeClass('loading');
				jQuery('body').addClass('quickview');
				
				// Variants change price
				jQuery('#price-quick').html(jQuery('#productSelectQV option:selected').attr('rel'));
				jQuery('#price-quick-compare').html(jQuery('#productSelectQV option:selected').attr('compare'));
				jQuery('#productSelectQV').change(function(){
					var selectedPrice = jQuery('#productSelectQV option:selected').attr('rel');
					var selectedPriceCompare = jQuery('#productSelectQV option:selected').attr('compare');
					jQuery('#price-quick').html(selectedPrice);
					jQuery('#price-quick-compare').html(selectedPriceCompare);
				});
				//Quantity change
				jQuery('.js--qty-adjuster.js--minus').click(function(){
					var currentQuantity = jQuery('#quantityqv').val();
					if(currentQuantity>1){
						currentQuantity--;
						jQuery('#quantityqv').val(currentQuantity);
					}
				});
				jQuery('.js--qty-adjuster.js--add').click(function(){
					var currentQuantity = jQuery('#quantityqv').val();
					currentQuantity++;
					jQuery('#quantityqv').val(currentQuantity);
				});
				//Quick view images slideshow
				jQuery('#quickviewcarousel').flexslider({
					animation: "slide",
					controlNav: false,
					animationLoop: false,
					slideshow: false,
					itemWidth: 90,
					itemMargin: 5,
					asNavFor: '#quickviewslider'
				});
				   
				jQuery('#quickviewslider').flexslider({
					animation: "slide",
					controlNav: true,
					animationLoop: false,
					slideshow: false,
					sync: "#quickviewcarousel"
				});
				// Ajax add to cart for quick view
				jQuery('#addToCartQV').click(function(event){
					event.preventDefault();
					var selectedVariant = jQuery('#productSelectQV option:selected').val();
					var selectedQty = jQuery('#quantityqv').val();

					roadaddItem(selectedVariant, selectedQty, function(){
						jQuery.getJSON('/cart.js', function (cart, textStatus) {
							if(textStatus=='success'){
								//update small cart
								updateSmallCart(cart);
								//hide quick view
								hideQuickview();
								//show popup
									//prepare the popup after added to cart
								var popupContent = '<div class="popupATCshadow"></div><div class="popupATC"><span class="close"><i class="fa  fa-times-circle-o"></i></span>';
									popupContent += '<h1>SHOPPING CART</h1>';
									popupContent += '<div class="pp-info">';
										popupContent += '<h2>JUST ADDED TO YOUR CART</h2>';
										popupContent += '<img class="quickview-image" src="'+product.images[0]+'" alt="" />';
										popupContent += '<h3>'+product.title+' ('+jQuery('#productSelectQV option:selected').html()+')</h3>';
										popupContent += '<span>Qty: '+selectedQty+'</span>';
										popupContent += '<span>Price: '+jQuery('#price-quick').html()+'</span>';
									popupContent += '</div>';
									popupContent += '<div class="pc-info">';
										popupContent += '<h3>Shopping Cart:</h3>';
										if(cart.item_count==1){
											popupContent += '<p>'+cart.item_count+' item</p>';
										} else {
											popupContent += '<p>'+cart.item_count+' items</p>';
										}
										popupContent += '<p class="total">Total: '+Shopify.formatMoney( cart.total_price ).replace(' ','')+'</p>';
										popupContent += '<a href="/collections">Continue Shopping</a>';
										popupContent += '<a href="/cart">View Cart</a>';
									popupContent += '</div>';
								popupContent += '</div>';
								jQuery('body').append(popupContent);
								jQuery('.popupATC .close').click(function(){
									jQuery('.popupATC').fadeOut(300, function(){
										jQuery('.popupATC').remove();
										jQuery('.popupATCshadow').remove();
									});
								});
								jQuery('.popupATCshadow').click(function(){
									jQuery('.popupATC').fadeOut(300, function(){
										jQuery('.popupATC').remove();
										jQuery('.popupATCshadow').remove();
									});
								});
							}
						});
					});
				});
			});
		});
	});
	//Close quick view
	jQuery('.close-quickview').click(function(event){
		event.preventDefault();
		hideQuickview();
	});
	//Hide quick view when click out of box
	jQuery('.quickshadow').click(function (e) {
		var container = jQuery("#quick-modal");
		if (!container.is(e.target) // if the target of the click isn't the container...
			&& container.has(e.target).length === 0) // ... nor a descendant of the container
		{
			hideQuickview();
		}
	});
	
	//Go to top
	jQuery('.gototop').click(function(){
		jQuery("html, body").animate({ scrollTop: 0 }, "slow");
	});
	
	//Blog on home page
	jQuery('.grid-blog-item').each(function(){
		jQuery(this).bind('mouseover click', function(){
			jQuery('.grid-blog-item').removeClass('open');
			jQuery('.grid-blog-item').addClass('close');
			jQuery(this).addClass('open');
		});
	});
	//Product image zoom
	jQuery("#productPhotoImg").elevateZoom({
		tint:true,
		tintColour:'#17cbc0',
		tintOpacity:0.5,
		zoomWindowOffetx: 10,
		gallery:'productThumbs',
		galleryActiveClass: 'active',
		loadingIcon: '//cdn.shopify.com/s/files/1/0572/5445/t/3/assets/loading.gif?3532435226988370126',
		easing : true,
		responsive: true
	});
	//pass the images to Fancybox 
	jQuery("#productPhotoImg").bind("click", function(e) { 
		var ez = jQuery('#productPhotoImg').data('elevateZoom');
		
		jQuery.fancybox(ez.getGalleryList());
		
		return false; 
	});
	//gallery images click when disable zoom
    /*jQuery('#productThumbs li a').each(function(){
      jQuery(this).click(function(event){
      	event.preventDefault();
        var largeImage = jQuery(this).attr('data-zoom-image');
        jQuery('#productPhotoImg').attr('src', largeImage);
      });
    });*/
});

// Scroll
var currentP = 0;
jQuery(window).scroll(function(){
	var headerH = jQuery('.site-header').height();
	var scrollP = jQuery(window).scrollTop();
	
	if(scrollP != currentP){
		//Menu
		if(scrollP >= headerH){
			jQuery('.site-header').addClass('smaller');
			jQuery('#ajaxifyDrawer').addClass('smaller');
			jQuery('.gototop').addClass('show');
		} else {
			jQuery('.site-header').removeClass('smaller');
			jQuery('#ajaxifyDrawer').removeClass('smaller');
			jQuery('.gototop').removeClass('show');
		}
		currentP = jQuery(window).scrollTop();
	}
});

// Responsive
jQuery(window).bind('load resize', function(){
	var zoomImage = jQuery('#productPhotoImg');
	jQuery('.zoomContainer').css({'height': zoomImage.height(), 'width': zoomImage.width()});
	jQuery('.zoomTint').css({'height': zoomImage.height(), 'width': zoomImage.width()});
});