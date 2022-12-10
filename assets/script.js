let notes = [];
let categories = [];
let noteEditor = new bootstrap.Offcanvas($('#offcanvasnote'));
let menuPanel = new bootstrap.Offcanvas($('#offcanvasmenu'));

$(document).ready(function(){
	showNotesList();
	showCategoriesList();
});


$('.searchform').submit(function(){
	return false;
});


$(document).on('input', '#search', function(){
	showNotesList('search', this.value);
});


$(document).on('click', '.show-all', function(){
	showNotesList('', '');
});


$(document).on('click', '.show-pinned', function(){
	showNotesList('pinned', true);
});


$(document).on('click', '.category-filter', function(){
	if(this.innerText == 'All'){
		showNotesList('category', '');
	} else {
		showNotesList('category', this.innerText);
	}
	menuPanel.hide();
});


$(document).on('click', '.note', function(){
	editNote($(this).attr('data-note'));
	noteEditor.show();
});


$(document).on('click', '.pin', function(e){
	e.stopPropagation();
	let imgSrc = $(this).attr('src');
	if(imgSrc.includes('pin.svg')){
		$(this).attr('src','assets/pin-fill.svg');
	} else {
		$(this).attr('src','assets/pin.svg');
	}
	pinNote($(this).closest('.note').attr('data-note'));
});


$(document).on('click', '.share', function(e){
	e.stopPropagation();
	copyNote($(this).closest('.note').attr('data-note'));
	showAlert('Note Copied');
});


$(document).on('click', '.delete', function(e){
	e.stopPropagation();
	$('#deleteConfirmModal').modal('show');
	$('.delete-confirm').attr('data-note', $(this).closest('.note').attr('data-note'));
});


$(document).on('click', '.delete-confirm', function(e){
	if($('.delete-confirm').attr('data-note') != ""){
		deleteNote($('.delete-confirm').attr('data-note'));
		$('.delete-confirm').attr('data-note', '');
		showAlert('Note Deleted');
	} else {
		showAlert('Something Went Wrong');
	}
	$('#deleteConfirmModal').modal('hide');
});


$(document).on('click', '.delete-no,.delete-cancel', function(e){
	$('.delete-confirm').attr('data-note', '');
});


$(document).on('click', '.category', function(){
	editCategory($(this).attr('data-category'));
});


$(document).on('click', '.cat-delete', function(e){
	e.stopPropagation();
	updateNotesCategory($(this).closest('.category').children(":first").text(), 'Uncategorized');
	deleteCategory($(this).closest('.category').attr('data-category'));
});


/* Note Form Validation */
$('#noteCategory').change(function(){
	if($(this).val() == ""){
		$(this).addClass('is-invalid').removeClass('is-valid');
	} else {
		$(this).addClass('is-valid').removeClass('is-invalid');
	}
});

$('#noteTitle').on('input', function(){
	if($(this).val() == ""){
		$(this).addClass('is-invalid').removeClass('is-valid');
	} else {
		$(this).addClass('is-valid').removeClass('is-invalid');
	}
});

$('#noteContent').on('input', function(){
	if($(this).val() == ""){
		$(this).addClass('is-invalid').removeClass('is-valid');
	} else {
		$(this).addClass('is-valid').removeClass('is-invalid');
	}
});

$('#noteform').submit(function(e){
	e.preventDefault();
	let is_valid_submit = true;
	
	if($('#noteCategory').val() == ""){
		$('#noteCategory').addClass('is-invalid').removeClass('is-valid');
		is_valid_submit = false;
	} else {
		$('#noteCategory').addClass('is-valid').removeClass('is-invalid');
	}
	if($('#noteTitle').val() == ""){
		$('#noteTitle').addClass('is-invalid').removeClass('is-valid');
		is_valid_submit = false;
	} else {
		$('#noteTitle').addClass('is-valid').removeClass('is-invalid');
	}
	if($('#noteContent').val() == ""){
		$('#noteContent').addClass('is-invalid').removeClass('is-valid');
		is_valid_submit = false;
	} else {
		$('#noteContent').addClass('is-valid').removeClass('is-invalid');
	}
	
	if(is_valid_submit){
	
		if($('#noteId').val() != ""){
			noteid = $('#noteId').val();
			updateNote(noteid);
			showAlert('Note Updated');
		} else {
			noteid = generateUUID();
			
			let noteData = {
				id: noteid,
				pin: false,
				category: $('#noteCategory').val(),
				title: $('#noteTitle').val(),
				content: $('#noteContent').val(),
				trash: false,
				last_updated: Date.now(),
				created_on: Date.now(),
			};
			notes.push(noteData);
			saveNotesToStorage(notes);
			showNotesList();
			showAlert('Note Created');
		}
		
		noteEditor.hide();
		$('#noteform')[0].reset();
		$('#noteCategory, #noteTitle, #noteContent').removeClass('is-valid is-invalid');
		
	}
});

$('.close-note, .close-note-box').click(function(){
	$('#noteform')[0].reset();
	$('#noteCategory, #noteTitle, #noteContent').removeClass('is-valid is-invalid');
});
/* Note Form Validation Ends */


/* Category Form Validation */
$('#categoryName').on('input', function(){
	if($(this).val() == ""){
		$(this).addClass('is-invalid').removeClass('is-valid');
	} else {
		$(this).addClass('is-valid').removeClass('is-invalid');
	}
});

$('#categoryform').submit(function(e){
	e.preventDefault();
	let is_valid_submit = true;
	let categoryData = '';
	
	if($('#categoryName').val() == ""){
		$('#categoryName').addClass('is-invalid').removeClass('is-valid');
		is_valid_submit = false;
	} else {
		$('#categoryName').addClass('is-valid').removeClass('is-invalid');
	}
	
	if(is_valid_submit){
		if($('#categoryId').val() != ""){
			categoryid = $('#categoryId').val();
			updateCategory(categoryid);
		} else {
			categoryid = generateUUID();
			
			let categoryData = {
				id: categoryid,
				name: $('#categoryName').val(),
				last_updated: Date.now(),
				created_on: Date.now(),
			};
			categories.push(categoryData);
			saveCategoriesToStorage(categories);
			showCategoriesList();
		}
		
		$('#categoryform')[0].reset();
		$('#categoryName').removeClass('is-valid is-invalid');
	}
});

$('.close-categories').click(function(){
	$('#categoryform')[0].reset();
	$('#categoryName').removeClass('is-valid is-invalid');
});
/* Category Form Validation Ends */


$('#noteform, #categoryform').on('reset', function() {
	$("input[type='hidden']", $(this)).val('');
});


function pinNote(noteid){
	if(noteid != ""){
		noteIndex = notes.findIndex((note => note.id == noteid));
		notes[noteIndex].pin = (notes[noteIndex].pin) ? false : true;
		saveNotesToStorage(notes);
	}
}


function editNote(noteid){
	if(noteid != ""){
		notes.forEach(function (note) {
			if(noteid === note.id){
				$('#noteId').val(note.id);
				$('#noteCategory').val(note.category);
				$('#noteTitle').val(note.title);
				$('#noteContent').val(note.content);
			}
		});
	}
}


function updateNote(noteid){
	if(noteid != ""){
		noteIndex = notes.findIndex((note => note.id == noteid));
		notes[noteIndex].category = $('#noteCategory').val();
		notes[noteIndex].title = $('#noteTitle').val();
		notes[noteIndex].content = $('#noteContent').val();
		notes[noteIndex].last_updated = Date.now();
		
		saveNotesToStorage(notes);
		showNotesList();
	}
}


function deleteNote(noteid){
	if(noteid != ""){
		notes = notes.filter((note) => note.id !== noteid);
		saveNotesToStorage(notes);
		showNotesList();
	}
}


function copyNote(noteid){
	if(noteid != ""){
		notes.forEach(function (note) {
			if(noteid === note.id){
				navigator.clipboard.writeText(note.content);
			}
		});
	}
}


function showNotesList(checkType = '', checkValue = ''){
	$('.notes-list').empty();
	let noteslist = '';
	if (localStorage["notes"]) {
		noteslist = localStorage.getItem('notes');
	}
	if(noteslist != ""){
		let noteCount = 0;
		$('.no-notes').hide();
		notes = JSON.parse(atob(noteslist));
		if(notes.length > 0){
			if(checkType != ""){
				if(checkValue != ""){
					if(checkType == 'search'){
						notes.forEach(function (note) {
							if(note.title.includes(checkValue) || note.content.includes(checkValue)){
								showNote(note);
								noteCount++;
							}
						});
					} else if(checkType == 'category'){
						notes.forEach(function (note) {
							if(note.category == checkValue){
								showNote(note);
								noteCount++;
							}
						});
					} else if(checkType == 'pinned'){
						notes.forEach(function (note) {
							if(note.pin == checkValue){
								showNote(note);
								noteCount++;
							}
						});
					}
				} else {
					notes.forEach(function (note) {
						showNote(note);
						noteCount++;
					});
				}
			} else {
				notes.forEach(function (note) {
					showNote(note);
					noteCount++;
				});
			}
			
			if(noteCount == 0){
				$('.no-notes').show();
			}
		}
	} else {
		$('.no-notes').show();
	}
}


function showNote(note){
	$('.notes-list').append('<div class="col-sm-6 col-md-4 col-lg-3 note" data-note="'+ note.id +'">\
		<div class="card">\
			<div class="card-body">\
				<img class="img-fluid pin" src="'+ ((note.pin) ? 'assets/pin-fill.svg' : 'assets/pin.svg') +'">\
				<h6 class="badge bg-dark fw-normal">'+ note.category +'</h6>\
				<h5 class="card-title text-truncate">'+ note.title +'</h5>\
				<p class="card-text text-truncate">'+ note.content +'</p>\
				<div class="text-end">\
					<img class="img-fluid me-2 edit" src="assets/edit.svg">\
					<img class="img-fluid me-2 share" src="assets/files.svg">\
					<img class="img-fluid delete" src="assets/trash.svg">\
				</div>\
			</div>\
		</div>\
	</div>');
}


function editCategory(categoryid){
	if(categoryid != ""){
		categories.forEach(function (category) {
			if(categoryid === category.id){
				$('#categoryId').val(category.id);
				$('#categoryName').val(category.name);
			}
		});
	}
}


function updateCategory(categoryid){
	if(categoryid != ""){
		categoryIndex = categories.findIndex((category => category.id == categoryid));
		
		updateNotesCategory(categories[categoryIndex].name, $('#categoryName').val())
		
		categories[categoryIndex].name = $('#categoryName').val();
		categories[categoryIndex].last_updated = Date.now();
		
		saveCategoriesToStorage(categories);
		showCategoriesList();
	}
}


function updateNotesCategory(categoryName, updatedCategoryName){
	if(notes.length > 0){
		notes.forEach(function (note) {
			if(note.category == categoryName){
				note.category = updatedCategoryName;
			}
		});
		
		saveNotesToStorage(notes);
		showNotesList();
	}
}


function deleteCategory(categoryid){
	if(categoryid != ""){
		categories = categories.filter((category) => category.id !== categoryid);
		saveCategoriesToStorage(categories);
		showCategoriesList();
	}
}


function showCategoriesList(){
	$('.categories-list').empty();
	let categorieslist = '';
	if (localStorage["categories"]) {
		categorieslist = localStorage.getItem('categories');
	} else {
		//Generates If No Categories Found
		categories.push({
			id: generateUUID(),
			name: 'Uncategorized',
			last_updated: Date.now(),
			created_on: Date.now()
		});
		categorieslist = btoa(JSON.stringify(categories));
	}
	if(categorieslist != ""){
		categories = JSON.parse(atob(categorieslist));
		if(categories.length > 0){
			
			$('.categories-filter-list').empty();
			
			//Empty Category Dropdown and set empty option
			$('#noteCategory').empty();
			$('#noteCategory').append('<option value="" selected="">Select</option>');
			
			categories.forEach(function (category) {
				showCategory(category);
				showfilterCategory(category);
				showdropdownCategory(category);
			});
		}
	}
}


function showCategory(category){
	$('.categories-list').append('<div class="bg-light rounded my-2 px-3 py-2 d-flex justify-content-between '+
		( category.name != 'Uncategorized' ? 'category':'')+'" data-category="'+ category.id +'">\
		<div>'+ category.name +'</div>' +
		( category.name != 'Uncategorized' ?
		'<div>\
			<img class="img-fluid me-1 cat-edit" src="assets/edit.svg">\
			<img class="img-fluid cat-delete" src="assets/trash.svg">\
		</div>' : '') +
	'</div>');
}


function showfilterCategory(category){
	$('.categories-filter-list').append('<div class="bg-light rounded my-2 px-3 py-2 category-filter">'+ category.name +'</div>');
}


function showdropdownCategory(category){
	$('#noteCategory').append('<option value='+ category.name +'>'+ category.name +'</option>');
}


function showAlert(msg = ""){
	$('.alert-messages').html('<div class="alert">' + msg + '</div>');
	setTimeout(function(){ $('.alert-messages').empty(); }, 2000);
}


function saveNotesToStorage(notes){
	if(notes.length > 0){
		localStorage.setItem("notes", btoa(JSON.stringify(notes)));
	} else {
		localStorage.setItem("notes", "");
	}
}


function saveCategoriesToStorage(categories){
	if(categories.length > 0){
		localStorage.setItem("categories", btoa(JSON.stringify(categories)));
	} else {
		localStorage.setItem("categories", "");
	}
}


function generateUUID() { // Public Domain/MIT
	var d = new Date().getTime();//Timestamp
	var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16;//random number between 0 and 16
		if(d > 0){//Use timestamp until depleted
			r = (d + r)%16 | 0;
			d = Math.floor(d/16);
		} else {//Use microseconds since page-load if supported
			r = (d2 + r)%16 | 0;
			d2 = Math.floor(d2/16);
		}
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}