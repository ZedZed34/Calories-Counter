<script>
  import { user } from '$lib/stores/user';
  import { ACTIVITY_LEVELS } from '$lib/utils/calories';
  import { get } from 'svelte/store';
  import { createEventDispatcher } from 'svelte';

  export let showAdvanced = true;
  export let showButton = true;

  const dispatch = createEventDispatcher();

  // Initialize with empty form, don't use stored values for clean start
  let form = {
    sex: '',
    age: '',
    heightCm: '',
    weightKg: '',
    activityKey: '',
    targetWeightKg: ''
  };

  function handleGetResult() {
    user.set(form);
    dispatch('calculate', form);
  }
</script>

<div class="card">
  <h2 class="title">Your Details (Metric)</h2>
  <div class="grid">
    <select bind:value={form.sex}>
      <option value="" disabled selected>Select your sex</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>

    <input type="number" min="10" max="100" bind:value={form.age} placeholder="Enter your age" />

    <input type="number" min="100" max="230" step="1" bind:value={form.heightCm} placeholder="Enter your height (cm)" />

    <input type="number" min="30" max="250" step="0.1" bind:value={form.weightKg} placeholder="Enter your weight (kg)" />

    <select bind:value={form.activityKey} class="span-2">
      <option value="" disabled selected>Select your activity level</option>
      {#each ACTIVITY_LEVELS as lvl}
        <option value={lvl.key}>{lvl.label}</option>
      {/each}
    </select>

    {#if showAdvanced}
      <input type="number" min="40" max="200" step="0.5" bind:value={form.targetWeightKg} placeholder="Enter your target weight (kg)" class="span-2" />
    {/if}
  </div>
  
  {#if showButton}
    <button class="get-result-btn" on:click={handleGetResult}>
      Get Result
    </button>
  {/if}
</div>

<style>
  .card { padding: 1rem; border-radius: 12px; background: var(--surface); box-shadow: var(--shadow); }
  .title { margin: 0 0 .75rem 0; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
  .span-2 { grid-column: span 2; }
  input, select { 
    padding: .8rem 1rem; 
    border: 1px solid var(--line); 
    border-radius: 8px; 
    background: var(--bg); 
    color: #e8edf4; 
    font-size: .95rem;
    transition: border-color 0.2s ease;
  }
  input::placeholder {
    color: var(--muted);
    opacity: 0.8;
  }
  input:focus, select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  select option[disabled] {
    color: var(--muted);
  }
  select:invalid {
    color: var(--muted);
  }
  select:valid {
    color: #e8edf4;
  }
  .get-result-btn { 
    margin-top: 1rem; 
    padding: 0.8rem 2rem; 
    background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
    color: white; 
    border: none; 
    border-radius: 8px; 
    font-size: 1rem; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  .get-result-btn:hover { 
    background: linear-gradient(135deg, #2563eb, #1e40af); 
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }
  .get-result-btn:active { 
    transform: translateY(0); 
  }
</style>
