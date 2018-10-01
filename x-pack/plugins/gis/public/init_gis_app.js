/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import {
  uiModules
} from 'ui/modules';
import './shared/services/gis_workspace_provider';
import chrome from 'ui/chrome';
import 'ui/autoload/all';
import {
  timefilter
} from 'ui/timefilter';
import { getStore, gisStateSync } from './store/store';
import { setTimeFilters } from './actions/store_actions';
import { Inspector } from 'ui/inspector';
import { inspectorAdapters } from './kibana_services';
import { SavedObjectSaveModal } from 'ui/saved_objects/components/saved_object_save_modal';
import { showSaveModal } from 'ui/saved_objects/show_saved_object_save_modal';

// hack to wait for angular template to be ready
const waitForAngularReady = new Promise(resolve => {
  const checkInterval = setInterval(() => {
    const hasElm = !!document.querySelector('#gis-top-nav');
    if (hasElm) {
      clearInterval(checkInterval);
      resolve();
    }
  }, 10);
});

export function initGisApp(resolve) {
  // default the timepicker to the last 24 hours
  chrome.getUiSettingsClient().overrideLocalDefault(
    'timepicker:timeDefaults',
    JSON.stringify({
      from: 'now-24h',
      to: 'now',
      mode: 'quick'
    })
  );

  uiModules
    .get('app/gis', [])
    .controller('TimePickerController',
      ($scope, gisWorkspace) => {
        $scope.topNavMenu = [{
          key: 'inspect',
          description: 'Open Inspector',
          testId: 'openInspectorButton',
          run() {
            Inspector.open(inspectorAdapters, {
              title: 'Layer requests'
            });
          }
        }, {
          key: 'save',
          description: 'Save Visualization',
          testId: 'visualizeSaveButton',
          run: async () => {
            const currentMapState = await getCurrentMapState();
            console.log(currentMapState);
            const saveSettings = ({ newTitle }) => {
              let savedObjectId = gisStateSync.get('workspaceId'); 
              if (savedObjectId) {
                return gisWorkspace.update(savedObjectId,
                  { mapState: currentMapState, title: newTitle })
                  .then(({ id }) => ({ id }));
              } else {
                return gisWorkspace.save({ mapState: currentMapState,
                  title: newTitle })
                  .then(({ id }) => {
                    if (id) gisStateSync.set('workspaceId', id);
                    return { id };
                  });
              }
            };
            const saveModal = (
              <SavedObjectSaveModal
                onSave={saveSettings}
                onClose={() => {}}
                title={'Save map settings'}
                showCopyOnSave={false}
                objectType={gisWorkspace.getType()}
              />);
            showSaveModal(saveModal);
          }
        }];
        timefilter.enableTimeRangeSelector();
        timefilter.enableAutoRefreshSelector();

        Promise.all([waitForAngularReady]).then(resolve());
      });
}

async function getCurrentMapState() {
  const store = await getStore();
  const customReplacer = (key, value) => {
    if (typeof value === 'number') {
      return value.toString();
    }
    return value;
  };
  const { map } = store.getState();
  const stringMap = JSON.stringify(map, customReplacer);
  return (stringMap);
}


getStore().then(store => {
  timefilter.on('timeUpdate', () => {
    const timeFilters = timefilter.getTime();
    store.dispatch(setTimeFilters(timeFilters));
  });
});