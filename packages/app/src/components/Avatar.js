import React from 'react';
import Gravatar from 'react-gravatar';
// import {useUser} from "@auth0/nextjs-auth0";

const Avatar = props => {

    // const {user} = useUser();

    return (
        <div>
            {/*<img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" />*/}
            <Gravatar
                // email={user?.email || "example@example.com"}
                    email={"example@example.com"}
                      size={props.size || 28}
                      rating="pg"
                      // default="monsterid"
                      className={props.className}  />
        </div>
    );
};

Avatar.propTypes = {

};

export default Avatar;