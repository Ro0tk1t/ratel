// Copyright 2020 Dgraph Labs, Inc. and Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

import { useDispatch, useSelector } from "react-redux";

import { sanitizeUrl } from "../lib/helpers";
import * as actions from "../actions/connection";
import { clickSidebarUrl } from "../actions/ui";

import SidebarLoginControl from "./SidebarLoginControl";

import "./ServerConnectionModal.scss";

export default function ServerConnectionModal() {
    const dispatch = useDispatch();
    const onHide = () => dispatch(clickSidebarUrl(""));
    const { serverHistory } = useSelector(state => state.connection);
    const [urlInput, setUrlInput] = useState(serverHistory[0].url);
    const [showError, setShowError] = useState(false);

    const urlInputSanitized = sanitizeUrl(urlInput);
    const activeServer = serverHistory.find(s => s.url === urlInputSanitized);

    const activeUrl = serverHistory[0].url;
    useEffect(() => {
        // When connected server URL is changed by any action -- update input
        setUrlInput(activeUrl);
    }, [activeUrl]);

    const connectTo = url => {
        if (!url.trim()) {
            setShowError(true);
            return;
        }
        dispatch(actions.updateUrl(url));
    };

    const renderSettings = () => {
        if (!activeServer) {
            return (
                <Alert variant="warning">
                    New URL entered. Click 'Connect' before customizing{" "}
                    <strong>{urlInputSanitized}</strong>{" "}
                </Alert>
            );
        }

        return (
            <>
                <Card>
                    <Card.Body>
                        <Card.Subtitle>ACL Account</Card.Subtitle>
                        <SidebarLoginControl />
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Body>
                        <Card.Subtitle>Connection Settings</Card.Subtitle>
                        <Form.Group controlId="queryTimeoutInput">
                            <Form.Label>Query timeout (seconds):</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                step="1"
                                placeholder="<timeout in seconds>"
                                value={activeServer.queryTimeout}
                                onChange={e => {
                                    const newTimeout = parseInt(e.target.value);
                                    if (newTimeout > 0) {
                                        dispatch(
                                            actions.setQueryTimeout(
                                                activeServer.url,
                                                newTimeout,
                                            ),
                                        );
                                    }
                                }}
                            />
                        </Form.Group>
                    </Card.Body>
                </Card>
            </>
        );
    };

    const alreadyConnected = urlInputSanitized === serverHistory[0].url;
    const urlInputBlock = (
        <div className="url-input-box">
            <label htmlFor="serverUrlInput">Dgraph server URL:</label>

            <div className="form-group">
                <input
                    id="serverUrlInput"
                    type="text"
                    placeholder="https://dgraph.example.com:port"
                    value={urlInput}
                    onChange={event => {
                        const value = event.target.value;
                        setShowError(value && !value.trim());
                        setUrlInput(value);
                    }}
                    style={{ width: "100%" }}
                />
                {showError ? (
                    <p
                        style={{
                            color: "#dc3545",
                            marginTop: "5px",
                        }}
                    >
                        The URL field cannot be empty
                    </p>
                ) : (
                    <br />
                )}
                <Button
                    size="sm"
                    variant={!alreadyConnected ? "primary" : "default"}
                    onClick={() => connectTo(urlInput)}
                    disabled={alreadyConnected || showError}
                >
                    {alreadyConnected ? "Connected" : "Connect"}
                </Button>
            </div>
        </div>
    );

    const historyDisplay = (
        <>
            <h6>Recent Servers</h6>
            <ListGroup>
                {serverHistory.map(s => (
                    <ListGroup.Item
                        key={s.url}
                        title={s.url}
                        active={s.url === urlInputSanitized}
                        onClick={() => setUrlInput(sanitizeUrl(s.url))}
                    >
                        <p>{s.url}</p>
                        <p className="minor">{s.version}</p>
                        <Button
                            disabled={s.url === serverHistory[0].url}
                            className="btn-connect"
                            variant={
                                s.url === serverHistory[0].url
                                    ? "light"
                                    : "primary"
                            }
                            size="sm"
                            onClick={() => connectTo(s.url)}
                        >
                            {s.url === serverHistory[0].url ? (
                                <i className="fas fa-check-circle" />
                            ) : (
                                <i className="fas fa-chevron-circle-right" />
                            )}
                        </Button>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </>
    );

    return (
        <Modal centered show={true} size="lg" onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Server Connection</Modal.Title>
            </Modal.Header>
            <Modal.Body className="server-connection-modal-body">
                <Container>
                    <Row className="main-row">
                        <Col xs={6} lg={4} className="col-history">
                            {historyDisplay}
                        </Col>
                        <Col xs={6} lg={8} className="col-props">
                            {urlInputBlock}
                            <div className="settings">{renderSettings()}</div>
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    className="pull-left"
                    variant="secondary"
                    onClick={onHide}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}