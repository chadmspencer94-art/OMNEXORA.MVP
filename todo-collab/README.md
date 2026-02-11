# 📋 Todo Collab

A beautiful, production-ready real-time collaborative todo application built with modern web technologies.

## ✨ Features

- 🔐 **User Authentication** - Secure email/password authentication
- ⚡ **Real-time Sync** - Live updates across all connected clients
- 🌙 **Dark Mode** - Beautiful dark theme (default) with toggle
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🔌 **Offline Support** - Works without internet using IndexedDB
- 🔗 **Shareable Links** - Share todo lists with others
- 🎨 **Premium Polish** - Modern UI with Tailwind CSS
- ♿ **Accessible** - Semantic HTML and ARIA labels
- 🚀 **Optimized** - Fast loading and smooth interactions

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3 with custom design tokens
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Offline**: IndexedDB for local data persistence
- **State Management**: React hooks + Supabase real-time subscriptions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- (Optional) Supabase account for production features

### Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Copy `.env.example` to `.env` and add your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Run the development server:**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Demo Mode

The app works in **demo mode** without Supabase configuration:
- Uses IndexedDB for local storage
- Mock authentication
- Single-user experience
- All features work locally

Perfect for testing and development!

## 🗄️ Supabase Setup (Optional)

To enable real-time collaboration:

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run this SQL in Supabase SQL Editor:

```sql
-- Create todos table
create table todos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  list_id text not null,
  title text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table todos enable row level security;

-- Create policies
create policy "Users can view their own todos"
  on todos for select
  using (auth.uid() = user_id);

create policy "Users can insert their own todos"
  on todos for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own todos"
  on todos for update
  using (auth.uid() = user_id);

create policy "Users can delete their own todos"
  on todos for delete
  using (auth.uid() = user_id);

-- Enable real-time
alter publication supabase_realtime add table todos;
```

3. Add your Supabase URL and anon key to `.env`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (Supabase credentials)
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables
6. Deploy!

## 🏗️ Project Structure

```
src/
├── components/        # React components
│   ├── AuthForm.tsx   # Authentication UI
│   ├── TodoList.tsx   # Main todo list view
│   ├── TodoItem.tsx   # Individual todo item
│   ├── AddTodo.tsx    # Add todo form
│   └── ShareModal.tsx # Share list modal
├── hooks/             # Custom React hooks
│   ├── useAuth.ts     # Authentication logic
│   └── useTodos.ts    # Todo CRUD + real-time
├── lib/               # Core libraries
│   ├── supabase.ts    # Supabase client
│   └── offline.ts     # IndexedDB wrapper
├── types/             # TypeScript types
│   └── todo.ts        # Data models
├── App.tsx            # Root component
├── main.tsx           # App entry point
└── index.css          # Global styles + Tailwind
```

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color palette:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      },
    },
  },
}
```

### Features

- Add tags/categories to todos
- Implement due dates and reminders
- Add priority levels
- Enable rich text editing
- Add file attachments

## 🐛 Troubleshooting

### "Cannot connect to Supabase"

- Check your `.env` file has correct credentials
- Verify Supabase project is active
- Ensure RLS policies are set up correctly

### "Todos not syncing"

- Check browser console for errors
- Verify real-time is enabled in Supabase
- Check network tab for subscription errors

### "Offline mode not working"

- Ensure IndexedDB is enabled in your browser
- Check browser console for storage errors
- Try clearing browser data and reloading

## 📄 License

MIT License - feel free to use this project for learning or production!

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 🙏 Acknowledgments

Built following the Grok-powered agentic architecture prompt with:
- Zero hallucinations
- Tool-first development
- Incremental builds
- Human-in-loop checkpoints

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
