<!-- src/routes/+layout.svelte -->
<script>
    import { onMount } from 'svelte';
    
    let isHydrated = false;
    onMount(() => { isHydrated = true; });
</script>

<svelte:head>
    <title>Кото-Мир - Питомник породистых кошек</title>
    <meta name="theme-color" content="#667eea">
    <style>
        /* Критические стили */
        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%) !important;
            color: #333 !important;
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
    </style>
</svelte:head>

<main>
    <slot />
</main>

<style>
    /* Основные стили */
    main {
        padding: 0;
        margin: 0;
    }
</style>