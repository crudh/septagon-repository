import { fetchMetadata } from './fetch';
import { loadMetadata, saveMetadata } from './store';

const init = app => {
  app.get('/:name', (req, res) => {
    const name = req.params.name;
    console.log(`----- ${name} - ${req.originalUrl}`);

    if (!name) {
      console.log('* no name - returning 404');
      res.status(404).send({ message: 'Not found' });
      return;
    }

    const fetchMetadataCallback = (err, data) => {
      if (data) {
        saveMetadata(name, data);

        res.send(data);
        return;
      }

      if (err) {
        res.status(500).send({ message: err });
      } else {
        res.status(404).send({ message: 'Not found' });
      }
    };

    const loadMetadataCallback = (err, data) => {
      if (data) {
        res.send(data);
        return;
      }

      console.log(`* ${name} - no metadata in storage`);
      fetchMetadata(name, fetchMetadataCallback);
    };

    loadMetadata(name, loadMetadataCallback);
  });
};

export default {
  init
};
