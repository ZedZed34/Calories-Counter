<script>
  export let title = '';
  export let kcal = 0;
  export let proteinG = 0;
  export let fatG = 0;
  export let carbsG = 0;
</script>

<div class="card">
  <h3 class="title">{title}</h3>
  <div class="kcal">{kcal} kcal/day</div>
  <div class="macros">
    <div><strong>{proteinG}g</strong><span>Protein</span></div>
    <div><strong>{fatG}g</strong><span>Fat</span></div>
    <div><strong>{carbsG}g</strong><span>Carbs</span></div>
  </div>
</div>

<style>
  .card { padding: 1rem; border-radius: 12px; background: var(--surface); box-shadow: var(--shadow); }
  .title { margin: 0 0 .35rem 0; font-weight: 600; }
  .kcal { font-size: 1.25rem; margin-bottom: .5rem; }
  .macros { display: grid; grid-template-columns: repeat(3,1fr); gap:.5rem; }
  .macros div { display:flex; flex-direction:column; align-items:center; }
  .macros span { font-size:.85rem; color: var(--muted); }
</style>
