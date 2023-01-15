import React from 'react';
import Gravatar from 'react-gravatar';
import PropTypes from "prop-types";

const Avatar = ({email, size, className}) => {

    return (
        <div>
            <Gravatar
                    email={email || "example@example.com"}
                      size={size || 28}
                      rating="pg"
                      // default="monsterid"
                      className={className}  />
        </div>
    );
};

Avatar.propTypes = {
    email: PropTypes.string,
    size: PropTypes.number,
};

export default Avatar;