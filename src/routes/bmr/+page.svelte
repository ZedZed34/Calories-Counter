<script>
  import { user } from '$lib/stores/user';
  import { bmr } from '$lib/utils/calories';
  import UserForm from '$lib/components/UserForm.svelte';
  import { get } from 'svelte/store';
  $: u = get(user);
</script>

<svelte:head>
  <title>BMR Calculator (Metric)</title>
  <meta name="description" content="Calculate your Basal Metabolic Rate (Mifflin–St Jeor, metric)." />
</svelte:head>

<h2>BMR (Basal Metabolic Rate)</h2>
<UserForm showAdvanced={false} />
<p style="margin-top:.5rem">Your BMR: <strong>{bmr(u)} kcal/day</strong></p>
