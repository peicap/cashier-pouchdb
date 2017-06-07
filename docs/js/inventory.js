/** ----------------
	Inventory Database
--------------------**/

var inventory = new PouchDB('inventory');
var elNew = document.querySelector('a#itemNew');

function d(){
	inventory.destroy();
};

inventory.changes({
  since: 'now',
  live: true
}).on('change', inventoryDocs);


function getVal(event){
	var a = document.querySelector('input#itemCode').value;
	var b = document.querySelector('input#itemLength').value;
	var c = document.querySelector('input#itemWidth').value;
	var d = document.querySelector('input#itemStock').value;
	var e = document.querySelector('input#itemPrice').value;
	var f = document.querySelector('input#itemColor').value;
	var g = document.querySelector('input#itemImg');

	if(a === '' | b === '' | c === '' | d === '' | e === '' | f === '') {
		Materialize.toast('Please complete the fields before entering a new item.', 4000)
	} else {
		newInventory(a, b, c, d, e, f, g.files[0]);
	};
};

function inventoryDocs() {
	inventory.allDocs({include_docs:true, descending:false}, function(err, doc){
		displayInventory(doc.rows)
		countStock(doc.rows); 
	}).catch(function(err){
		console.log(err)
	});
};

function countStock(data){
	var stock = [];
	var el = document.querySelector('span#countStock');
	el.innerHTML = 0;
	data.forEach(function(data){stock.push(leftStock(data.doc));});
	for(i=0; stock.length > i; i++) {
		var el = document.querySelector('span#countStock');
		update = parseInt(stock[i]) + parseInt(el.innerHTML);
		el.innerHTML = update;
	}
};

function newForm(){
	var collection = document.querySelector('ul#deleteDisplay')
	var a = document.createElement('a');
	a.setAttribute('href', '#addItem')
	a.className = 'modal-trigger z-depth-0 collection-item indigo-text text-lighten-3 btn waves-effect waves-light';
	a.innerHTML = 'Create item ';
	collection.appendChild(a);
};

function newInventory(code, length, width, stock, price, color, img) {
	var doc = {
		"_id": 'JF00' + code + '_' + new Date().toISOString(),
		"code": code,
		"length":  length,
		"width":  width,
		"stock":  stock,
		"price":  price,
		"color": color,
		"_attachments": {
			"image": {
				"type": img.type,
				"content_type": 'image/jpg',
				"data": img
			}
		}
 	};

 	inventory.put(doc).then(function(results){
 		console.log(results);
 		Materialize.toast("Sucessfully added item " + doc.code, 4000);
 		console.log(doc._attachments.image.data)
 	}).catch(function(err){
 		console.log(err)
 	});
};

function leftStock(data){return data.stock};

function displayInventory(data){ 
	var ul = document.createElement('ul');
	ul.id = 'deleteDisplay';
	ul.className = 'collection'
	var inventoryDisplay = document.querySelector('div#inventoryDisplay')
	inventoryDisplay.innerHTML = ""
	inventoryDisplay.appendChild(ul);
	newForm();
	data.forEach(function(data){
		ul.appendChild(collection(data.doc));
	});
};

function collection(data){
	var li = document.createElement('li');
	var image = document.createElement('img');
	var title = document.createElement('span');
	var details = document.createElement('p');
	var deleteBtn = document.createElement('a');
	var stockBtn = document.createElement('a');	
	li.setAttribute('class', "collection-item avatar");
	inventory.getAttachment(data._id, "image").then(function(blob){
		var url = URL.createObjectURL(blob)
		image.setAttribute('class', 'circle');
		image.setAttribute('src', url);
	});
	title.setAttribute('class', 'title');
	title.innerHTML = 'JF00' + data.code;
	details.innerHTML = 'Php ' + data.price + '<br>' + data.stock + ' stock(s) left';
	stockBtn.setAttribute('class', 'waves-effect waves-light green white-text z-depth-1 modal-trigger');
	stockBtn.setAttribute('style', 'margin-right: 10px; padding: 3px 6px; border-radius: 2px; cursor: pointer;');
	stockBtn.setAttribute('href', '#addStock')
	stockBtn.innerHTML = 'EDIT STOCK';
	stockBtn.addEventListener('click', stockButtonPressed.bind(this, data._id))
	deleteBtn.setAttribute('class', 'btn red waves-effect waves-light secondary-content');
	deleteBtn.addEventListener('click', deleteButtonPressed.bind(this, data))
	deleteBtn.innerHTML = 'Delete'
	li.appendChild(image);
	li.appendChild(title);
	li.appendChild(details);
	li.appendChild(stockBtn);
	li.appendChild(deleteBtn);	

	return li
};


function deleteButtonPressed(doc) {
	inventory.remove(doc);
	Materialize.toast('Item Deleted!', 4000);
}

function stockButtonPressed(doc){
	inventory.get(doc).then(function(data){
		var content = document.querySelector('div#addStockContent');
		content.innerHTML ='';
		var ul = document.createElement('ul');
		var li = document.createElement('li');
		var image = document.createElement('img');
		var title = document.createElement('span');
		var details = document.createElement('p');
		var addBtn = document.createElement('a');	
		var input = document.createElement('input');
		var label = document.createElement('label')
		ul.setAttribute('class', 'collection');
		li.setAttribute('class', "collection-item avatar")
		inventory.getAttachment(data._id, "image").then(function(blob){
			var url = URL.createObjectURL(blob)
			image.setAttribute('class', 'circle');
			image.setAttribute('src', url);
		});
		title.setAttribute('class', 'title');
		title.innerHTML = 'JF00' + data.code;
		details.innerHTML = data.stock + ' current stock(s) left';

		label.setAttribute('for', 'input');
		label.innerHTML = 'Add new stock';
		input.setAttribute('class', 'validate');
		input.setAttribute('type', 'text');
		input.setAttribute('placeholder', 'Current stock: ' + data.stock);
		input.id = 'inputStock'
		addBtn.setAttribute('class', 'btn green waves-effect waves-light secondary-content')
		addBtn.innerHTML = 'Add';
		addBtn.addEventListener('click', updateStock.bind(this, data._id));

		content.appendChild(ul);
		ul.appendChild(li);
		li.appendChild(image);
		li.appendChild(title)
		title.appendChild(details);
		li.appendChild(label);
		li.appendChild(input);
		li.appendChild(addBtn);
		}).catch(function(err){console.log(err)})
};

function updateStock(data){
	inventory.get(data).then(function(doc){
		var el = document.querySelector('input#inputStock');
		value = parseInt(el.value)
		current = parseInt(doc.stock);
		update = value + current; 
		console.log(update);
		doc.stock = update;
		Materialize.toast('JF00' + doc.code + '\'s stock is now ' + doc.stock, 4000)
		return inventory.put(doc);

	}).then(function(result){
		return inventory.get(data);
	}).then(function(doc){
		console.log(doc)		
		stockButtonPressed(data)
	})																																																																										
}

inventoryDocs();