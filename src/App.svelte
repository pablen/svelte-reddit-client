<script lang="ts">
  import { formatDistanceToNow } from 'date-fns'
  import { onMount } from 'svelte'
  import { crossfade } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'
  import { fade } from 'svelte/transition'
  import { flip } from 'svelte/animate'

  import * as utils from './utils'

  import type { Post, PostName } from './types'

  const mql = window.matchMedia ? window.matchMedia('(max-width: 800px)') : null
  let isSidebarVisible = mql && !mql.matches
  let selectedPost: Post | null = null
  let after: PostName | null = null
  let posts: Post[] = []

  let promise = fetchPosts()
  let sidebarRef: HTMLElement

  onMount(() => {
    const handler = (ev: MediaQueryListEvent) => {
      isSidebarVisible = !ev.matches
    }
    if (mql) mql.addEventListener('change', handler)
    return () => {
      unsubscribeFromScroll()
      if (mql) mql.removeEventListener('change', handler)
    }
  })

  const [send] = crossfade({
    duration: (d) => Math.sqrt(d * 200),
    fallback() {
      return {
        duration: 200,
        easing: quintOut,
        css: (t) => `opacity: ${t}`,
      }
    },
  })

  let infiniteScrollThresholdInPx = 350

  function scrollHandler(ev: Event) {
    const element = ev.currentTarget as HTMLUListElement
    if (
      element.clientHeight + element.scrollTop + infiniteScrollThresholdInPx >=
      element.scrollHeight
    ) {
      unsubscribeFromScroll()
      promise = fetchPosts()
    }
  }

  function subscribeToScroll() {
    sidebarRef.addEventListener('scroll', scrollHandler)
  }

  function unsubscribeFromScroll() {
    sidebarRef.removeEventListener('scroll', scrollHandler)
  }

  $: hasPosts = posts.length > 0

  async function fetchPosts() {
    return utils.fetchPosts(after).then(({ data }) => {
      posts = [...posts, ...data.children.map(utils.extractPost)]
      after = data.after
      subscribeToScroll()
    })
  }

  function handleShowSidebar() {
    isSidebarVisible = true
  }

  function handleSelect(postName: PostName) {
    selectedPost = posts.find((post) => post.name === postName) || null
    if (mql && mql.matches) {
      isSidebarVisible = false
    }
  }

  function handleDismissOne(postName: PostName) {
    posts = posts.filter((post) => post.name !== postName)
  }

  function handleDismissAll() {
    unsubscribeFromScroll()
    posts = []
    promise = fetchPosts()
  }
</script>

<style>
  .container {
    display: flex;
    position: relative;
  }

  .sidebar {
    flex-shrink: 0;
    position: absolute;
    order: -1;
    background-color: var(--color-bg-light);
    width: 320px;
    top: 0;
    left: 0;
    height: 100vh;
    will-change: transform;
    transition: transform 600ms;
    transform: translateX(0%);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .sidebar[aria-hidden='true'] {
    transform: translateX(-110%);
  }

  .sidebar-header {
    font-weight: 600;
    text-align: center;
    padding: 1rem 0.5rem;
    position: sticky;
    top: 0;
    background-color: rgb(245 245 245 / 70%);
    backdrop-filter: blur(5px);
    z-index: 1;
  }

  .sidebar-footer {
    padding: 0.75rem;
    position: sticky;
    bottom: 0;
  }

  .loading-msg {
    text-align: center;
    margin-top: 5rem;
  }

  .post-list {
    list-style-type: none;
    margin: 0;
    padding: 0;
    flex-grow: 1;
  }

  .post-list > li {
    margin: 0.25rem 0.5rem;
    position: relative;
    border-radius: 4px;
  }

  .post-btn {
    font: inherit;
    background: transparent;
    border: none;
    padding: 0.5rem 0.5rem 1.25rem 0.5rem;
    display: block;
    width: 100%;
    outline: none;
    text-align: left;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    font-size: 0.75rem;
  }

  .post-btn[aria-selected='true'] {
    background: rgb(0 0 0 / 0.05);
  }

  .post-list > li:focus,
  .post-list > li:hover {
    background: rgb(0 0 0 / 0.075);
  }

  .thumb {
    display: block;
    width: 80px;
    height: 80px;
    object-fit: cover;
    margin-right: 0.5rem;
  }

  .post-meta {
    margin-top: 0.25rem;
    opacity: 0.5;
  }

  .dismiss-post-btn {
    background: transparent;
    border: none;
    font: inherit;
    padding: 0 0.5rem;
    margin: 0;
    font-size: 0.75rem;
    cursor: pointer;
    outline: none;
    position: absolute;
    bottom: 0.25rem;
    right: 0;
  }

  .dismiss-post-btn:focus,
  .dismiss-post-btn:hover {
    color: var(--color-primary);
  }

  .dismiss-all-btn {
    border-radius: 1rem;
    background: white;
    border: none;
    font: inherit;
    padding: 0.5rem 1rem;
    margin: 0 auto;
    display: block;
    width: auto;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.4px;
    cursor: pointer;
    color: var(--color-copy);
    outline: none;
    box-shadow: 0 1px 2px black;
  }

  .dismiss-all-btn:focus,
  .dismiss-all-btn:hover {
    background: var(--color-bg-light);
  }

  .loading-overlay {
    display: block;
    text-align: center;
    margin: 0 auto;
    font-size: 9px;
    text-transform: uppercase;
    border-radius: 10px;
    padding: 1rem 1rem 0.5rem;
  }

  .main {
    padding: 1.5rem;
    max-height: 100vh;
    overflow-y: auto;
    box-shadow: 3px 0px 10px black;
    z-index: 0;
    flex-grow: 1;
    min-height: 100vh;
  }

  .main-title {
    margin: 0;
    font-size: 2rem;
    line-height: 1;
    font-weight: 200;
    color: var(--color-primary);
  }

  .full-size-img {
    display: block;
    width: 50%;
    margin: 3rem auto;
  }

  @media (min-width: 800px) {
    .sidebar,
    .sidebar[aria-hidden='true'] {
      position: relative;
      transform: none;
    }

    .main {
      padding: 2.5rem 5rem;
      z-index: 1;
    }

    .main-title {
      line-height: 1.1;
      font-size: 3rem;
    }

    .show-sidebar-btn {
      display: none;
    }
  }
</style>

<div class="container">
  <main class="main">
    <button on:click={handleShowSidebar} class="show-sidebar-btn" type="button">
      Show Sidebar
    </button>
    {#if selectedPost}
      <article>
        <h1 class="main-title">{selectedPost.title}</h1>

        <div class="post-meta">
          by {selectedPost.author} {formatDistanceToNow(selectedPost.createdAt * 1000, { addSuffix: true })}
        </div>

        {#if selectedPost && selectedPost.fullSizePicture}
          <img
            class="full-size-img"
            src={selectedPost.fullSizePicture}
            alt="" />
        {/if}
      </article>
    {:else}
      <p>Select some post.</p>
    {/if}
  </main>

  <nav class="sidebar" aria-hidden={!isSidebarVisible} bind:this={sidebarRef}>
    <header class="sidebar-header">Reddit Posts</header>

    {#if !hasPosts}
      {#await promise}
        <p class="loading-msg">Loading posts...</p>
      {:then _}
        {''}
      {/await}
    {/if}

    <ul class="post-list">
      {#each posts as post (post.name)}
        <li
          in:fade
          out:send={{ key: post.name }}
          animate:flip={{ duration: 300 }}>
          <button
            aria-selected={selectedPost && selectedPost.name === post.name}
            on:click={() => handleSelect(post.name)}
            class="post-btn"
            type="button">
            {#if post.thumb}
              <img class="thumb" src={post.thumb} alt="" />
            {/if}
            <div>
              <div class="post-title">{post.title}</div>
              <div class="post-meta">
                by {post.author} {formatDistanceToNow(post.createdAt * 1000, { addSuffix: true })}
              </div>
            </div>
          </button>
          <button
            on:click={() => handleDismissOne(post.name)}
            class="dismiss-post-btn"
            type="button">
            Dismiss
          </button>
        </li>
      {/each}
    </ul>

    {#if hasPosts}
      {#await promise}
        <span class="loading-overlay">Loading more...</span>
      {:then _}
        {''}
      {/await}

      <footer class="sidebar-footer">
        <button
          on:click={handleDismissAll}
          class="dismiss-all-btn"
          type="button">
          Dismiss All
        </button>
      </footer>
    {/if}
  </nav>
</div>

<!-- 
	# TODO

	- [x] build
	- [x] typescript
	- [x] detail view (fullsize image render)
  - [x] infinite scroll when empty list
  - [ ] Read status
	- [ ] sidebar hide/collapse in different breakpoints
	- [ ] sidebar toggle btn styles
	- [ ] errors on remote requests
	- [ ] refactor, extract
 -->
