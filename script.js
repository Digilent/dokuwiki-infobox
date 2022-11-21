/* DOKUWIKI:include_once scripts/digilent-product-database-client-bundle.js */

function renderInfobox(category, product, layout) {
    let client = new DigilentProductDatabaseClient('https://digilent-products-dev.s3-us-west-2.amazonaws.com/');

    var data = {
        client: client
    };

    client.loadProduct(category, product).then((productDescriptor) => {
        data.productDescriptor = productDescriptor;

        console.log(productDescriptor);

        console.log('Loading Complete');

        var vm = new Vue({
            el: '#digilent-infobox',
            data: data
        });

        document.getElementById('digilent-infobox').classList.remove('hidden');
        client.loadInfobox('digilent-infobox', productDescriptor, layout);
    });
}

jQuery(document).ready(function () {    
    let infobox = document.getElementById('digilent-infobox'); 
    if (infobox != null) {       
        let category = infobox.getAttribute('category');
        let product = infobox.getAttribute('product');  
        let layout = JSON.parse(decodeURIComponent(infobox.getAttribute('layout')));  
        renderInfobox(category, product, layout);
    }    
});


