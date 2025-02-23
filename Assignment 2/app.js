import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import bodyParser from 'body-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Read posts from JSON file
async function readPosts() {
  try {
    const data = await fs.readFile('posts.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write posts to JSON file
async function writePosts(posts) {
  await fs.writeFile('posts.json', JSON.stringify(posts, null, 2));
}

// Routes
app.get('/', async (req, res) => {
  const posts = await readPosts();
  res.render('home', { posts });
});

app.get('/post', async (req, res) => {
  const posts = await readPosts();
  const post = posts.find(p => p.id === parseInt(req.query.id));
  if (post) {
    res.render('post', { post });
  } else {
    res.status(404).send('Post not found');
  }
});

app.get('/add-post', (req, res) => {
  res.render('addPost');
});

app.post('/add-post', async (req, res) => {
  const posts = await readPosts();
  const newPost = {
    id: posts.length + 1,
    title: req.body.title,
    content: req.body.content,
    date: new Date().toISOString()
  };
  posts.push(newPost);
  await writePosts(posts);
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Blog app listening at http://localhost:${port}`);
});