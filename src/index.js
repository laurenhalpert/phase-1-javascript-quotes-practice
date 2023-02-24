document.addEventListener("DOMContentLoaded", () => {
    let sortButton = document.createElement("button");
    sortButton.id = "sort-button";
    sortButton.innerText="Sort OFF";
    sortButton.addEventListener("click", (event)=> handleclick(event))
    function handleclick(event) {
        if (sortButton.innerText === "Sort OFF") {
            sortButton.innerText = "Sort ON";

            //getQuotesSorted();
            getPresortedQuotes();
            
        } else if (sortButton.innerText === "Sort ON"){
            sortButton.innerText = "Sort OFF";
            
            document.querySelector("#quote-list").innerHTML="";
            getQuotes();
        }
    }
    document.querySelector("h1").appendChild(sortButton);
    function getQuotes () {
      fetch("http://localhost:3000/quotes?_embed=likes")
      .then(resp=> resp.json())
      .then(data => data.forEach(elem=> {
        renderQuote(elem);
        
        }))
    }
    getQuotes();

    function getQuotesSorted () {
        fetch("http://localhost:3000/quotes?_embed=likes")
        .then(resp=> resp.json())
        .then(data => {
            sortQuote(data);
            data.forEach(elem => {
                renderQuote(elem);
            })
        })
    }
    function sortQuote(data) {
        document.querySelector("#quote-list").innerHTML="";
        function compareAuthors(a,b) {
            if (a.author < b.author) {
                return -1;
            } else if (a.author > b.author) {
                return 1;
            }
            return 0;
        }
        data.sort(compareAuthors);
    }

    function getPresortedQuotes() {
        document.querySelector("#quote-list").innerHTML="";
        fetch("http://localhost:3000/quotes?_sort=author")
        .then(resp=> resp.json())
        .then(data => data.forEach(elem=> renderQuote(elem)))
    }
    
    

    function renderQuote(quote) {
      let ul = document.querySelector("#quote-list");
      let li = document.createElement("li");
      li.className = "quote-card";
      li.innerHTML = `
      <blockquote class = "blockquote">
        <p class = "mb-0">${quote.quote}</p>
        <footer class = "blockquote-footer">${quote.author} </footer>
        <br>
        <button class = "btn-success">Likes: <span>0</span></button>
        <button class='btn-danger'>Delete</button>
        <button class = "editor">Edit</button>
        <form id="edit-quote-form">
            <input type="text" class="edit-quote-input">
            <input type="text" class="edit-author-input">
            <input type="submit" class="sub-btn" value="Update">
        </form>
      </blockquote>
      `
      function getLikes(quote) {
            let span = li.querySelector("span");
            
            fetch(`http://localhost:3000/likes?quoteId=${quote.id}`)
            .then(resp=>resp.json())
            .then(data=>{
                span.innerText=data.length;
            })
        }
        getLikes(quote);
      li.querySelector(".btn-danger").addEventListener("click", () => deleteQuote(quote))
      function deleteQuote(quote) {
        fetch (`http://localhost:3000/quotes/${quote.id}`, {
            method: "DELETE",
            headers:{
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        })
        .then (resp => resp.json())
        .then(data => console.log(data))

        ul.innerHTML = "";
        getQuotes();
      }  
      li.querySelector(".btn-success").addEventListener("click", (event)=> likeQuote(event))
      function likeQuote(event) {
        let span = li.querySelector("span");
        count = span.innerText;
        count ++;
        span.innerText = count;
        let likeObj = {
            quoteId: quote.id
        }
        fetch(`http://localhost:3000/likes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application.json"
            },
            body: JSON.stringify(likeObj)
        })
        .then(resp => resp.json())
        .then(data => console.log(data))
        
      }
      
      

      li.querySelector(".editor").addEventListener("click", (event)=> editQuote(event));
      function editQuote(event) {
        li.querySelector("#edit-quote-form").style.visibility = "visible";
        let inputQuote = li.querySelector(".edit-quote-input");
        let inputAuthor = li.querySelector(".edit-author-input");
        inputQuote.value = quote.quote;
        inputAuthor.value = quote.author;
        
      }
      li.querySelector("#edit-quote-form").addEventListener("submit", (event)=> updateQuote(event));
      
      function updateQuote(event){
        event.preventDefault();
        

        let quoteObj = {};
            quoteObj.id =quote.id;
            quoteObj.quote= event.target[0].value;
            quoteObj.author= event.target[1].value;
        
        
        fetch (`http://localhost:3000/quotes/${quoteObj.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(quoteObj)
        })
        .then(resp => resp.json())
        .then(data => console.log(data))
        ul.innerHTML = "";
        getQuotes();

        li.querySelector("#edit-quote-form").reset();
      }
      ul.appendChild(li);
    }
    

    document.querySelector("#new-quote-form").addEventListener("submit", (event) =>createNewQuote(event));

    function createNewQuote(event) {
        event.preventDefault();
        console.log(event.target[0].value);
        let quoteObj = {
            quote: event.target[0].value,
            author: event.target[1].value,
        };
        postQuote(quoteObj);
        document.querySelector("#new-quote-form").reset();
    }

    function postQuote(obj) {
        fetch(`http://localhost:3000/quotes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(obj)
        })
        .then(resp => resp.json())
        .then(data => {
            renderQuote(data);
        })
    }
  
  
  })