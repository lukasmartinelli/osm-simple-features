const rp = require('request-promise-native');

async function getValuesByPage(key, page) {
  return rp({
    uri: 'https://taginfo.openstreetmap.org/api/4/key/values',
    qs: {
			key: key,
			filter: 'all',
			lang: 'en',
      sortname: 'count',
      sortorder: 'desc',
      page: page,
      rp: 20,
      qtype: 'value',
      format: 'json_pretty'
    },
    json: true
  }).catch((err) => {
		return [];
	});
}

async function getValues(key) {
	let maxPages = 50;
	if (key.prevalent_values.length == 0 || key.values_all > 40000) {
		maxPages = 20;
	}
	if (key.users_all < 10 && !key.in_wiki) {
		maxPages = 1;
	}

  const values = [];
  let page = 1;
  let result = await getValuesByPage(key.key, page);

  while (hasData(result) && page <= maxPages) {
    values.push(...extractValues(result));
    page++;
    console.error('Fetched', values.length, 'values for key', key.key);
    result = await getValuesByPage(key.key, page);
  }

  return values;
}

async function getKeysByPage(page) {
  return rp({
    uri: 'https://taginfo.openstreetmap.org/api/4/keys/all',
    qs: {
			include: 'prevalent_values',
      sortname: 'in_wiki',
      sortorder: 'desc',
      page: page,
      rp: 40,
      qtype: 'key',
      format: 'json_pretty'
    },
    json: true
  });
}

function hasData(result) {
  return result.data && result.data.length;
}

function extractValues(result) {
  return result.data
    .filter((value) => value.in_wiki)
    .map((value) => ({
      count: value.count,
      fraction: value.fraction,
      value: value.value,
      in_wiki: value.in_wiki,
			description: value.description
    }));
}

function extractKeys(result) {
  return result.data
    .filter((key) => key.in_wiki)
    .map((key) => ({
			prevalent_values: key.prevalent_values || [],
			users_all: key.users_all,
			values_all: key.values_all,
      key: key.key,
      count_nodes: key.count_nodes,
      count_ways: key.count_ways,
      count_relations: key.count_relations,
      count_all: key.count_all,
			count_all_fraction: key.count_all_fraction
    }));
}

async function getKeys() {
  const keys = [];
  let page = 1;
  let result = await getKeysByPage(page);

  while (hasData(result) && result.data.some((k) => k.in_wiki)) {
		const k = extractKeys(result);
		await Promise.all(k.map(async (k) => {
			k.detailed_values = await getValues(k);
		}));
    keys.push(...k);
    page++;
    console.error('Fetched', keys.length, 'keys');
    result = await getKeysByPage(page);
  }

  return keys;
}

async function printTags() {
  const keys = await getKeys();
  keys.forEach((k) => {
    console.log(JSON.stringify(k));
  });
}

if (require.main === module) {
  printTags();
}
