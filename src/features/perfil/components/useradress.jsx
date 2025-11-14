import React from "react";

const UserAddress = () => {

    const {show, setShow} = React.useState(false);
    const saveAdress = [

        AddressLine1: 'AddressLine1',
        AddressLine2: 'AddressLine2',
        AddressLine3: 'AddressLine3',

    ],
    [
        AddressLine1: 'AddressLine4',
        AddressLine2: 'AddressLine5',
        AddressLine3: 'AddressLine6',
    ]

    return (
        <div className="useraddress">
            <h1 className="mainhead1">Tu direccion</h1>
            <div className="addressin">
                {saveadress.map((item, index) => (
                    return (
                        <div className="address" key={index}>
                            <span>{item.AddressLine1}</span>,
                            <span>{item.AddressLine2}</span>,
                            <span>{item.AddressLine3}</span>

                            <div className="delbtn">
                                
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    )
}

export default UserAddress;