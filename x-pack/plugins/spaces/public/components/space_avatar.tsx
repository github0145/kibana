/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiAvatar } from '@elastic/eui';
import React, { SFC } from 'react';
import { getSpaceColor, getSpaceInitials, MAX_SPACE_INITIALS } from '../../common';
import { Space } from '../../common/model/space';

interface Props {
  space: Partial<Space>;
  size?: 's' | 'm' | 'l' | 'xl';
  className?: string;
  announceSpaceName?: boolean;
}

export const SpaceAvatar: SFC<Props> = (props: Props) => {
  const { space, size, announceSpaceName, ...rest } = props;

  const spaceName = space.name ? space.name.trim() : '';

  return (
    <EuiAvatar
      type="space"
      data-test-subj={`space-avatar-${space.id}`}
      name={spaceName}
      {...!announceSpaceName && {
        // provide empty aria-label so EUI doesn't try to provide its own
        'aria-label': '',
      }}
      size={size || 'm'}
      initialsLength={MAX_SPACE_INITIALS}
      initials={getSpaceInitials(space)}
      color={getSpaceColor(space)}
      {...rest}
    />
  );
};

SpaceAvatar.defaultProps = {
  announceSpaceName: true,
};
